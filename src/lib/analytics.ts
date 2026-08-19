/**
 * Analitik yapılandırmasının tek kaynağı.
 *
 * Şimdilik yalnızca Google Tag Manager container'ı yüklenir; GA4, reklam
 * pikselleri ve dönüşüm etiketleri GTM arayüzünden yönetilecektir — koda
 * ayrıca eklenmez (çift izleme oluşturmamak için).
 */
export const GTM_ID = 'GTM-MWVJ2S27';

/**
 * Yalnızca canlı alan adında veri toplanır: dist önizlemeleri ve olası
 * yansımalar (ör. *.github.io) production ölçümünü kirletmez. Build-time
 * PROD kapısıyla birlikte çalışır (dev sunucusunda hiç basılmaz).
 */
export const ANALYTICS_HOSTNAME = 'pixelon.com.tr';
