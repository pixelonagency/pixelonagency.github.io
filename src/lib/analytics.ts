/**
 * Analitik yapılandırmasının tek kaynağı.
 *
 * Şimdilik yalnızca Google Tag Manager container'ı yüklenir; GA4, reklam
 * pikselleri ve dönüşüm etiketleri GTM arayüzünden yönetilecektir — koda
 * ayrıca eklenmez (çift izleme oluşturmamak için).
 */
export const GTM_ID = 'GTM-MWVJ2S27';

/**
 * GA4 ölçüm kimliği (web stream 13219601136). GA4 SİTE KODUNA EKLENMEZ:
 * ölçüm yalnızca GTM container'ındaki "GA4 - Google Tag - Pixelon" Google
 * tag'i üzerinden yapılır ve Consent Mode v2 `analytics_storage` sinyaline
 * tabidir. Bu sabit; testlerin, dokümanların ve ileride eklenecek etkinlik
 * yapılandırmalarının tek doğruluk kaynağıdır.
 */
export const GA4_MEASUREMENT_ID = 'G-15DCDNXNG7';

/**
 * Yalnızca canlı alan adında veri toplanır: dist önizlemeleri ve olası
 * yansımalar (ör. *.github.io) production ölçümünü kirletmez. Build-time
 * PROD kapısıyla birlikte çalışır (dev sunucusunda hiç basılmaz).
 */
export const ANALYTICS_HOSTNAME = 'pixelon.com.tr';
