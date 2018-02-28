#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "FS.h"

//Motor pin to pulse
const int PWM_PIN = D5;

//Wifi access point ssid
const char* ssid = "{SSID}";
//Wifi password
const char* password = "{PASSWORD}";

//MQTT server url
const char* mqtt_server = "{MQTT SERVER}";
//MQTT port
const unsigned int mqtt_port = 8883;
//MQTT client id
const char* client_id = "Actor";

//TSL enabled wifi client
WiFiClientSecure espClient;
//MQTT client
PubSubClient client(espClient);

//Motor states
typedef enum {
  standby,
  running
} MotorState;

//Motor parameters
typedef struct {
  MotorState state;
  unsigned int duration;
} MotorParameters;

//Current motor parameters
MotorParameters current_motor_parameters;

//start time of the motor
unsigned long startTime = 0;

/*
Method to setup wifi connection.
*/
void setup_wifi() {
  delay(10);

  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  //Try connecting
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

/*
Method to load the SSL self signed certificates into the wifi client.
The certificates have to be DER formatted and located on the SPIFFS file system.
*/
bool loadCertificates()
{
    bool success = SPIFFS.begin();;

    File ca = SPIFFS.open("/ca.crt", "r");
    if (!espClient.loadCACert(ca, ca.size()))
    {
        success = false;
        Serial.println("Failed to load root CA certificate!");
    }
    
    File cert = SPIFFS.open("/cert.crt", "r");
    if (!espClient.loadCertificate(cert, cert.size()))
    {
        success = false;
        Serial.println("Failed to load client certificate!");
    }

    File key = SPIFFS.open("/priv.key", "r");
    if (!espClient.loadPrivateKey(key, key.size()))
    {
        success = false;
        Serial.println("Failed to load private key!");
    }

    return success;
}

/*
Method to start the DC motor connected to PWM_PIN.

\param speed Motor speed between 0% and 100%
\param duration Duration in milliseconds to keep the motor running
*/
void start_motor(float speed, unsigned int duration) {
  current_motor_parameters.duration = duration;

  Serial.printf("Starting motor");

  float pwm_speed = speed * 10.23f;
  analogWrite(PWM_PIN, pwm_speed);

  current_motor_parameters.state = running;
  startTime = millis();
}

/*
Method to stop the DC motor connected to PWM_PIN.
*/
void stop_motor() {
  analogWrite(PWM_PIN, 0);
  current_motor_parameters.state = standby;
  Serial.printf("Stopping motor");
}

/*
Method to update the motor state by checking the duration, the motor has been running for.
*/
void update_motor_state() {
  if (current_motor_parameters.state == running) {
    unsigned long currentTime = millis();
    if (currentTime - startTime >= current_motor_parameters.duration) {
      stop_motor();
    }
  }
}

/*
Callback which is called when a MQTT message arrives.

\param topic The topic on which the message was sent to
\param payload The JSON formatted message payload
\param length The payload length
*/
void callback(char* topic, byte* payload, unsigned int length) {
  delay(1);
  digitalWrite(BUILTIN_LED, HIGH);
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (unsigned int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  StaticJsonBuffer<150> jsonBuffer; //Create a json buffer for parsing the payload
  JsonObject& root = jsonBuffer.parseObject(payload); //parse the payload

  if (!root.success()) {
    return;
  }

  float speed = root["speed"];
  unsigned int duration = root["duration"];

  start_motor(speed, duration);
  digitalWrite(BUILTIN_LED, LOW);
}

/*
Method to connect or reconnect to the MQTT server.
*/
void reconnect() {
  digitalWrite(BUILTIN_LED, HIGH);
  //Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    //Attempt to connect
    unsigned long start = millis();
   
    if (client.connect(client_id, "", "")) {
      Serial.println("connected");
      Serial.println(millis()-start);
      //... and resubscribe
      Serial.println("Attempting to subscribe to topic");
      bool res = client.subscribe("actors/{CERTIFICATE FINGERPRINT}");
      if (res) {
        Serial.println("Subscribed to topic");
        digitalWrite(BUILTIN_LED, LOW);
      } else {
        Serial.println("failed");
      }
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 1 seconds");
      //Wait 1 seconds before retrying
      delay(1000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PWM_PIN, OUTPUT);
  pinMode(BUILTIN_LED, OUTPUT); //Initialize the BUILTIN_LED pin as an output

  setup_wifi();
  loadCertificates();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop(); //MQTT client loop

  update_motor_state();
}
