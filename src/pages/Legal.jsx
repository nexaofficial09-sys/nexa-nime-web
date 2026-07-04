import React from 'react';
import { useParams, Link } from 'react-router-dom';

const legalContent = {
  tos: {
    title: "Terms of Service",
    content: (
      <>
        <p className="mb-4">Selamat datang di NEXA Nime. Dengan mengakses dan menggunakan platform kami, Anda menyetujui untuk mematuhi Ketentuan Layanan (Terms of Service) berikut. Harap membacanya dengan saksama.</p>
        <h3 className="font-semibold text-lg mt-6 mb-2">1. Penggunaan Layanan</h3>
        <p className="mb-4">Layanan NEXA Nime disediakan semata-mata untuk keperluan hiburan pribadi dan non-komersial. Anda tidak diperkenankan menggunakan platform ini untuk tujuan ilegal atau melanggar hukum yang berlaku di yurisdiksi Anda.</p>
        <h3 className="font-semibold text-lg mt-6 mb-2">2. Penafian (Disclaimer)</h3>
        <p className="mb-4">Semua layanan dan konten yang tersedia di NEXA Nime disediakan dengan status "sebagaimana adanya" (as is). Kami tidak memberikan jaminan apa pun, baik tersurat maupun tersirat, mengenai keakuratan, kelengkapan, atau ketersediaan konten pada platform kami.</p>
        <h3 className="font-semibold text-lg mt-6 mb-2">3. Perubahan Ketentuan</h3>
        <p className="mb-4">Kami berhak untuk mengubah atau memperbarui Ketentuan Layanan ini kapan saja tanpa pemberitahuan sebelumnya. Penggunaan berkelanjutan Anda atas situs ini setelah adanya perubahan menunjukkan penerimaan Anda terhadap ketentuan yang baru.</p>
      </>
    )
  },
  privacy: {
    title: "Privacy Policy",
    content: (
      <>
        <p className="mb-4">Di NEXA Nime, privasi pengunjung kami adalah salah satu prioritas utama. Kebijakan Privasi ini menjelaskan jenis informasi yang dikumpulkan dan dicatat oleh NEXA Nime serta bagaimana kami menggunakannya.</p>
        <h3 className="font-semibold text-lg mt-6 mb-2">Pengumpulan Data</h3>
        <p className="mb-4">Kami hanya mengumpulkan data yang diperlukan untuk mengoptimalkan pengalaman pengguna, seperti riwayat tontonan atau preferensi navigasi. Kami tidak mengumpulkan, menjual, atau menyebarkan informasi pribadi yang sensitif kepada pihak ketiga.</p>
        <h3 className="font-semibold text-lg mt-6 mb-2">File Log</h3>
        <p className="mb-4">NEXA Nime mengikuti prosedur standar menggunakan file log. Informasi yang dikumpulkan oleh file log termasuk alamat protokol internet (IP), jenis peramban (browser), penyedia layanan internet (ISP), serta tanggal dan waktu kunjungan, semata-mata untuk analisis tren dan administrasi situs.</p>
        <h3 className="font-semibold text-lg mt-6 mb-2">Cookies</h3>
        <p className="mb-4">Situs kami mungkin menggunakan "cookies" untuk meningkatkan pengalaman pengguna. Anda dapat mengatur peramban web Anda untuk menolak cookies jika Anda menginginkannya, namun beberapa fitur situs mungkin tidak berfungsi sebagaimana mestinya.</p>
      </>
    )
  },
  dmca: {
    title: "DMCA Policy",
    content: (
      <>
        <p className="mb-4">NEXA Nime menghormati hak kekayaan intelektual pihak lain dan mematuhi peraturan <strong>Digital Millennium Copyright Act (DMCA)</strong>.</p>
        <p className="mb-4">Harap dipahami bahwa <strong>NEXA Nime tidak menyimpan, menghosting, atau mengunggah file media atau video apa pun di server kami sendiri.</strong> Seluruh konten video yang tersedia pada platform ini di-hosting oleh layanan pihak ketiga yang sepenuhnya terpisah dari kami.</p>
        <h3 className="font-semibold text-lg mt-6 mb-2">Pengajuan Keluhan Hak Cipta</h3>
        <p className="mb-4">Jika Anda adalah pemilik sah hak cipta, atau agen yang berwenang, dan Anda meyakini bahwa suatu konten yang tertaut di situs kami melanggar hak cipta Anda, silakan hubungi langsung penyedia hosting pihak ketiga terkait (seperti Doodstream, MP4Upload, dll) untuk meminta penghapusan file.</p>
        <p className="mb-4">Setelah file tersebut dihapus oleh penyedia hosting pihak ketiga, tautan terkait secara otomatis tidak akan lagi dapat diakses melalui situs NEXA Nime.</p>
      </>
    )
  }
};

function Legal() {
  const { type } = useParams();
  
  const current = legalContent[type] || {
    title: "Halaman Tidak Ditemukan",
    content: <p>Halaman legal yang Anda cari tidak tersedia.</p>
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 min-h-[70vh]">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 bg-[#ffde00] text-[#1a202c] text-xs font-extrabold px-4 py-2 rounded-sm border-[2px] border-[#1a202c] shadow-[3px_3px_0_0_#1a202c] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_0_#1a202c] active:translate-y-0 active:shadow-[0px_0px_0_0_#1a202c] transition-all uppercase tracking-wider mb-8"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Kembali ke Beranda
      </Link>
      
      <div className="bg-white rounded-lg p-8 md:p-12 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-8 pb-6 border-b border-slate-100">
          {current.title}
        </h1>
        <div className="text-slate-600 leading-relaxed text-sm md:text-base">
          {current.content}
        </div>
      </div>
    </div>
  );
}

export default Legal;
