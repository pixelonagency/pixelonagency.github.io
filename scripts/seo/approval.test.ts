/**
 * Onay çıkarımı regresyon testleri.
 *
 * Korunan davranış: bir görev, AÇIK sahip onayı kanıtı olmadan onaylı bir
 * duruma yükselemez. 22 Ağu 2026'da `SEO-2026-0082` "ONAYLANDI" yazıldı ama
 * sahip yalnızca "UNBLOCKED / READY_FOR_APPROVAL" demişti. Bu test o hatanın
 * geri gelmesini engeller.
 */
import { describe, expect, test } from 'bun:test';
import { auditApprovals, checkApproval, isApprovalEvidence, NON_APPROVAL_SIGNALS } from './approval.mjs';

const approved = {
  status: 'APPROVED',
  approval_source: 'sahip mesajı 2026-08-22: "SEO-2026-0083 — APPROVED FOR PUBLISH"',
  approval_timestamp: '2026-08-22T13:00+03:00',
  approval_scope: 'TR + EN vaka çalışması yayını',
};

describe('checkApproval', () => {
  test('onaysız durumlar serbest — kanıt aranmaz', () => {
    expect(checkApproval('X', { status: 'READY_FOR_APPROVAL' }).ok).toBe(true);
    expect(checkApproval('X', { status: 'DEFERRED' }).ok).toBe(true);
    expect(checkApproval('X', { status: 'BLOCKED' }).ok).toBe(true);
  });

  test('üç alanı da olan onay geçer', () => {
    expect(checkApproval('SEO-2026-0083', approved).ok).toBe(true);
  });

  test.each(['approval_source', 'approval_timestamp', 'approval_scope'])('%s eksikse onay REDDEDİLİR', (field) => {
    const task = { ...approved, [field]: undefined };
    const result = checkApproval('SEO-2026-0082', task);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain(field);
      expect(result.fallback).toBe('READY_FOR_APPROVAL');
    }
  });

  test('boş string kanıt sayılmaz', () => {
    expect(checkApproval('X', { ...approved, approval_source: '   ' }).ok).toBe(false);
  });

  test.each([
    'APPROVED',
    'OWNER APPROVED',
    'APPROVED_FOR_PUBLISH',
    'APPROVED_FOR_PREPARATION',
    'PUBLISHED',
    'PUBLISHED / MEASURING',
    'APPROVED / PREPARED',
  ])('"%s" kanıtsız yazılamaz', (status) => {
    expect(checkApproval('X', { status }).ok).toBe(false);
  });
});

describe('isApprovalEvidence — dolaylı sinyaller onay değildir', () => {
  test.each(NON_APPROVAL_SIGNALS)('"%s" onay sayılmaz', (signal) => {
    expect(isApprovalEvidence(signal)).toBe(false);
  });

  test('paralel oturumun commit etmesi onay değildir', () => {
    expect(isApprovalEvidence('asset exists in repository, pushed by another session')).toBe(false);
  });

  test('kuru provanın PASS olması onay değildir', () => {
    expect(isApprovalEvidence('dry-run passed, gate passed')).toBe(false);
  });

  test('açık sahip talimatı onaydır', () => {
    expect(isApprovalEvidence('sahip mesajı: "SEO-2026-0086 — APPROVED"')).toBe(true);
  });
});

describe('auditApprovals', () => {
  test('temiz tabloda ihlal yok', () => {
    expect(auditApprovals({ A: approved, B: { status: 'READY_FOR_APPROVAL' } })).toEqual([]);
  });

  test('kanıtsız yükseltmeyi yakalar ve görev kimliğini söyler', () => {
    const problems = auditApprovals({
      'SEO-2026-0082': { status: 'APPROVED / PREPARED' },
      'SEO-2026-0081': { status: 'READY_FOR_APPROVAL' },
    });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('SEO-2026-0082');
  });

  test('görev olmayan girdiler çökmeye yol açmaz', () => {
    expect(auditApprovals({ a: null, b: 'metin', c: 42 })).toEqual([]);
  });
});
