# Sistem Pelacakan GPS dengan Data Waktu Nyata

Proyek ini adalah sistem pelacakan GPS yang mengumpulkan data waktu nyata tentang lintang, bujur, dan kecepatan menggunakan ESP32, MQTT, menyimpan data di database MySQL, dan menyediakan antarmuka web untuk memantau dan mengontrol sistem.

## Fitur

- Pelacakan waktu nyata koordinat GPS (lintang dan bujur)
- Perhitungan dan penyimpanan kecepatan berdasarkan data GPS
- Pemantauan geofence dan pemberitahuan
- Kontrol relay melalui antarmuka web
- Pengambilan data historis
- Pembaruan data waktu nyata menggunakan Socket.IO

## Persyaratan

- Node.js
- MySQL
- MQTT Broker (misalnya, CloudAMQP)

## Instalasi

1. **Kloning repositori:**

   ```sh
   git clone https://github.com/ferdilan/GPSTracker-ESP32-NodeJS.git
   cd your-repo

## Diagram Rangkaian
![GPS TRACKER_bb](https://github.com/Ferdilan/GPSTracker-ESP32-NodeJS/assets/90945904/f1943bb7-d929-4cab-a4de-b2014424e1fe)

## Penjelasan File Program
1. File fadil.ino untuk program pada esp32 menggunakan software Arduino IDE
2. Folder public berisi file index.html untuk menampilkan maps dan button control pada halaman web menggunakan localhost:3000
3. File server.js berisi kode untuk mengambil data dari MQTT broker. File ini dijalankan pada command promt menggunakan perintah "node server.js"
