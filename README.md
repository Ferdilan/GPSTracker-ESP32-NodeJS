# Sistem Pelacakan GPS dengan Data Waktu Nyata

Proyek ini adalah sistem pelacakan GPS yang mengumpulkan data waktu nyata tentang lintang, bujur, dan kecepatan menggunakan MQTT, menyimpan data di database MySQL, dan menyediakan antarmuka web untuk memantau dan mengontrol sistem.

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
