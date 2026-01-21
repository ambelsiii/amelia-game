/**
 * AUDIO ENGINE - Memory Game
 * Menangani efek suara menggunakan file eksternal (assets/flip.mp3)
 */

const sfx = {
    // Memuat file audio dari folder assets
    flipAudio: new Audio('assets/flip.mp3'),

    // Fungsi utama untuk memutar suara balik kartu
    click: function() {
        this.playExternal(this.flipAudio, 1.0);
    },

    // Suara saat kartu cocok (menggunakan file flip.mp3 tapi nada dicepatkan)
    match: function() {
        this.playExternal(this.flipAudio, 1.5); // Lebih cepat & tinggi
    },

    // Suara saat salah (menggunakan file flip.mp3 tapi nada diperlambat)
    fail: function() {
        this.playExternal(this.flipAudio, 0.7); // Lebih lambat & berat
    },

    // Suara kemenangan (memutar flip.mp3 berkali-kali secara cepat)
    win: function() {
        let count = 0;
        const interval = setInterval(() => {
            this.playExternal(this.flipAudio, 1.2 + (count * 0.1));
            count++;
            if (count > 3) clearInterval(interval);
        }, 150);
    },

    /**
     * Helper untuk memutar audio agar bisa tumpang tindih 
     * dan mengatur kecepatan nada (pitch/playbackRate)
     */
    playExternal: function(audioObj, rate = 1.0) {
        try {
            // Gunakan cloneNode agar suara bisa berbunyi bersamaan jika diklik cepat
            const soundClone = audioObj.cloneNode();
            soundClone.playbackRate = rate;
            soundClone.volume = 0.4; // Atur volume (0.0 sampai 1.0)
            
            const playPromise = soundClone.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Autoplay dicegah browser atau file tidak ditemukan.");
                });
            }
        } catch (e) {
            console.error("Gagal memutar suara:", e);
        }
    }
};