#include <WiFi.h>
#include <PubSubClient.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>


#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];

// Konfigurasi WiFi
//const char* ssid = "Kost Putra Lindisanti";
//const char* password = "semangat";
const char* wifiName = "Kost Putra Lindisanti";  // Ganti ke Polinema Hotspot
const char* wifiPass = "semangat";

const char* brokerUser = "ktgrefiu:ktgrefiu";                 //sesuaikan
const char* brokerPass = "ys82TkRnQnEQoubALkSCyBqzAUKXptSk";  // sesuaikan
const char* brokerHost = "mustang.rmq.cloudamqp.com";


const char* mqtt_topicpubBujur = "bujur";
const char* mqtt_topicpubLintang = "lintang";
// const char* mqtt_topicpubGpsData = "kordinat";

const char* mqtt_topicsub = "gps/location";  //belum dipakai

const int relayPin = 5;

// Inisialisasi objek GPS dan MQTT
TinyGPSPlus gps;
HardwareSerial ss(2);  // Menggunakan UART2 (pin 16 dan 17)

// Deklarasi client wifi
WiFiClient espClient;

// Deklarasi MQTT Client
PubSubClient client(espClient);


void KoneksiWIFI() {
  Serial.print("Konek ke: ");
  Serial.println(wifiName);

  WiFi.mode(WIFI_STA);
  WiFi.begin(wifiName, wifiPass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");

    // Membangkitkan ID client acak ke Message Broker
    String clientId = "fadil-";
    clientId += String(random(0xffff), HEX);

    if (client.connect(clientId.c_str(), brokerUser, brokerPass)) {
      Serial.println("connected");
      client.subscribe("relay/control");
      // register subscriber tp belum digunakan
      client.subscribe(mqtt_topicsub);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");

      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  ss.begin(9600, SERIAL_8N1, 16, 17);  // Menggunakan UART2 untuk GPS

  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW); // Mulai dengan relay off

  KoneksiWIFI();

  client.setServer(brokerHost, 1883);
  client.setCallback(callback);
}

void loop() {
  // Reconnect to MQTT if connection is lost
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // kirim data dummy
  /*
  int bujur = random(100);
  snprintf(msg, MSG_BUFFER_SIZE, "%d", bujur);
  client.publish(mqtt_topicpubBujur, msg);

  int lintang = random(100);
  snprintf(msg, MSG_BUFFER_SIZE, "%d", bujur);
  client.publish(mqtt_topicpubLintang, msg);
*/

  // Publish GPS data to MQTT topic
  while (ss.available() > 0) {
    gps.encode(ss.read());
    if (gps.location.isUpdated()) {
      // Format GPS data
      // String gpsData = String(gps.location.lat(), 6) + "," + String(gps.location.lng(), 6);  //format pengambilan lat&long sebelumnya
      String latitude = String(gps.location.lat(), 6);
      String longitude = String(gps.location.lng(), 6);

      
      // Publish GPS data to MQTT topic
      client.publish(mqtt_topicpubBujur, longitude.c_str());
      client.publish(mqtt_topicpubLintang, latitude.c_str());
      // client.publish(mqtt_topicpubGpsData, gpsData.c_str());

      //cetak ke serial monitor
      Serial.print("Publishing Bujur: ");
      Serial.println(longitude);
      Serial.print("Publishing Lintang: ");
      Serial.println(latitude);
      // Serial.print("Publishing Data: ");
      // Serial.println(gpsData);
                
      
    }
  }

  delay(1000);
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Payload data
  String StringPayload = "";

  // Konversi Char ke String
  for (int i = 0; i < length; i++) {
    StringPayload += (char)payload[i];
  }

  Serial.println("TOPIC: " + String(topic));
  Serial.println("PAYLOAD: " + String(StringPayload));

  if (strcmp(topic, "relay/control") == 0) {
    if (StringPayload == "on") {
      digitalWrite(relayPin, HIGH);
      Serial.println("Relay is ON");
    } else if (StringPayload == "off") {
      digitalWrite(relayPin, LOW);
      Serial.println("Relay is OFF");
    }
  }
}