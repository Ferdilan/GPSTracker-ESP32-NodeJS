const mqtt = require('mqtt');   //Untuk menghubungkan ke broker MQTT dan berkomunikasi menggunakan protokol MQTT.
const mysql = require('mysql'); //untuk menguhubungkan ke mysql
const express = require('express'); //untuk membuat server http
const http = require('http'); //untuk membuat server http
const socketIo = require('socket.io');  // Untuk komunikasi real-time antara server dan klien menggunakan WebSocket.



//Membuat instance Express, server HTTP, dan Socket.IO:
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// koneksi ke database
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'gps_tracking'
};

let db;

function handleDisconnect() {
    db = mysql.createConnection(dbConfig); // Buat koneksi baru

    db.connect(err => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            setTimeout(handleDisconnect, 2000); // Coba lagi setelah 2 detik
        } else {
            console.log('Connected to MySQL');
        }
    });

    db.on('error', err => {
        console.error('MySQL error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect(); // Coba koneksi ulang jika koneksi hilang
        } else {
            throw err;
        }
    });
}

handleDisconnect(); // Mulai koneksi pertama //mengatur koneksi ulang jika koneksi mysql hilang

// Rute untuk mendapatkan historis
// KODE INI HARUS DILETAKKAN SETELAH DEFINISI MYSQL & SEBELUM MEMULAI SERVER!!!
app.get('/history', (req, res) => {
    const query = 'SELECT * FROM location_history ORDER BY timestamp DESC LIMIT 100'; // ambil 100 data terbaru
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data from MySQL:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

// Endpoint untuk menghidupkan relay
app.get('/relay/on', (req, res) => {
    mqttClient.publish('relay/control', 'on');
    res.send('Relay turned on');
});

// Endpoint untuk mematikan relay
app.get('/relay/off', (req, res) => {
    mqttClient.publish('relay/control', 'off');
    res.send('Relay turned off');
});


// Konfigurasi broker MQTT
const brokerUrl = 'mqtt://mustang.rmq.cloudamqp.com';
const options = {
    clientId: '290444e9-f1e0-4fa8-8cc5-c7fe431e8e86',
    username: 'ktgrefiu:ktgrefiu',
    password: 'ys82TkRnQnEQoubALkSCyBqzAUKXptSk',
    connectTimeout: 5000,
    reconnectPeriod: 1000,
    clean: true
};

const mqttClient = mqtt.connect(brokerUrl, options);
   
//Event listener untuk koneksi ke broker MQTT:
mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    // mqttClient.subscribe('gps/location'); //belum digunakan
    mqttClient.subscribe('lintang');
    mqttClient.subscribe('bujur');
});

let coordinates = {
    longitude: null,
    latitude: null,
    altitude: null,
    speed: null
};
   

let trackingEnabled = true;


mqttClient.on('message', (topic, message) => {
    const value = parseFloat(message.toString());

    if (trackingEnabled){
        if (topic === 'bujur') {
            coordinates.longitude = value;
        } else if (topic === 'lintang') {
            coordinates.latitude = value;
        }
    }
    console.log(`Updated coordinates: ${JSON.stringify(coordinates)}`);

    if (coordinates.latitude && coordinates.longitude) {
        const { latitude, longitude } = coordinates;
        const query = 'INSERT INTO location_history (latitude, longitude) VALUES (?, ?)';
        db.query(query, [latitude, longitude], (err, result) => {
            if (err) {
                console.error('Error inserting data into MySQL:', err);
                return;
            }
            console.log('Data inserted into MySQL:', result.insertId);
        });

        io.emit('gpsUpdate', coordinates);
    }
});

// Middleware untuk menyajikan file statis
app.use(express.static('public')); 

//memulai server http
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// kode geofence
let geofences = [
    //{ name: 'Barak', lat: -7.945216, lng: 112.615484, radius: 100 } //untuk lokasi kos
    { name: 'Landungsari', lat: -7.925033, lng: 112.598116, radius: 100 } //untuk lokasi landungsari
    ];

// fungsi menghitung jarak menggunakan Haversine formula
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius bumi dalam meter
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Jarak dalam meter
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function checkGeofences(coords) {
    geofences.forEach(geofence => {
        const distance = getDistanceFromLatLonInM(coords.latitude, coords.longitude, geofence.lat, geofence.lng);
        const insideGeofence = distance <= geofence.radius;

        if (!geofenceStatus[geofence.name] && insideGeofence) {
            console.log(`Entering ${geofence.name}`);
            geofenceStatus[geofence.name] = true;
            io.emit('geofenceStatus', { geofence: geofence.name, status: 'enter' });
        } else if (geofenceStatus[geofence.name] && !insideGeofence) {
            console.log(`Exiting ${geofence.name}`);
            geofenceStatus[geofence.name] = false;
            io.emit('geofenceStatus', { geofence: geofence.name, status: 'exit' });
        }
    });
}
// cek apakah masih didalam radius
let geofenceStatus = {};





// Kode menghubungkan ke broker MQTT menggunakan mqtt.connect dengan opsi yang benar.
// Berlangganan ke topik bujur dan lintang.
// Menerima pesan dari topik dan memperbarui koordinat.
// Mengirim data koordinat ke klien menggunakan socket.io