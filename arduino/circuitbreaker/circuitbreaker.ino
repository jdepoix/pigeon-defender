#include <Arduino.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

//PEM formatted certificates in header file
#include "certificates.h"

//Button pinmask for PIN32 and PIN33
#define BUTTON_PIN_BITMASK 0x300000000 //2^33+2^32 in hex
#define PIN33 0x200000000
#define PIN32 0x100000000

//Wifi access point ssid
const char* ssid = "{SSID}";
//Wifi password
const char* password = "{PASSWORD}";

//MQTT server url
const char* mqtt_server = "{MQTT SERVER}";
//MQTT port
const unsigned int mqtt_port = 8883;
//MQTT client id
const char* client_id = "Circuit-Breaker";

//JSON formatted activation message
const char* activateMsg = "{\"active\":true}";
//JSON formatted deactivation message
const char* deactivateMsg = "{\"active\":false}";

//TSL enabled wifi client
WiFiClientSecure espClient;
//MQTT client
PubSubClient client(espClient);

/*
Method to setup wifi connection.
*/
bool setup_wifi()
{
    delay(10);

    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.begin(ssid, password);

    bool connected = false;
    //Try 10 times to connect
    for (int i = 0; i < 10; i++)
    {
        if (WiFi.status() == WL_CONNECTED)
        {
            Serial.println("");
            Serial.println("WiFi connected");
            Serial.println("IP address: ");
            Serial.println(WiFi.localIP());
            connected = true;
            break;
        }
        //Wait 1 seconds before retrying
        delay(1000);
    }

    return connected;
}

/*
Method to connect or reconnect to the MQTT server.
*/
bool reconnect()
{
    Serial.print("Connecting to MQTT Server");
    client.setServer(mqtt_server, mqtt_port);

    bool connected = false;
    //Try 10 times to connect
    for (int i = 0; i < 10; i++)
    {
        if (client.connect(client_id, "", ""))
        {
            Serial.println("Connected!");
            connected = true;
            break;
        }

        Serial.print("Failed to connect");
        Serial.println(client.state());
        //Wait 1 seconds before retrying
        delay(1000);
    }
    return connected;
}

/*
Method to load the SSL self signed certificates into the wifi client.
*/
bool loadCertificates()
{
    bool success = true;

    espClient.setCACert(root_CA);    
    espClient.setCertificate(cert);
    espClient.setPrivateKey(private_key);

    return success;
}

/*
Method to send an activation or deactivation message to the AWS MQTT broker to the device specific circuit-breakers topic.

\param activate If true is passed, an activation message is send, else a deactivation message is send.
*/
bool sendMessage(bool activate)
{
    bool success = false;
    Serial.println("Sending message");

    const char* current_message = activate ? activateMsg : deactivateMsg;

    setup_wifi();
    loadCertificates();
    reconnect();

    //Try 10 times to send
    for (int i = 0; i < 10; i++)
    {
        success = client.publish("circuit-breakers/{CERTIFICATE FINGERPRINT}", current_message);

        if(success)
        {
            Serial.println("Message sent");
            break;
        }

        Serial.println("Failed to send message");
        //Wait 1 seconds before retrying
        delay(1000);
    }
    
    return success;
}

/*
Method to send the activation or deactivation message, if the wakeup was caused by PIN32 or PIN33.
*/
void send_wakeup_message(){
  esp_sleep_wakeup_cause_t wakeup_reason;
  uint64_t status;

  wakeup_reason = esp_sleep_get_wakeup_cause();

  switch(wakeup_reason)
  {
    case ESP_SLEEP_WAKEUP_EXT1  : Serial.println("Wakeup caused by external signal using RTC_CNTL");
              status = esp_sleep_get_ext1_wakeup_status();
              if(status == PIN32) {
                Serial.println("Pin32");
                if(sendMessage(true)){
                  digitalWrite(25, HIGH); //light up green led, if circuit is activated
                }
              }
              else if(status == PIN33) {
                Serial.println("Pin33");
                if(sendMessage(false)){
                  digitalWrite(26, HIGH); //light up red led, if circuit is deactivated
                }
              }
              delay(5000);
              break;
    default : Serial.println("Wakeup was not caused by deep sleep"); break;
  }
}

void setup(){
  Serial.begin(115200);
  delay(1000); //Take some time to open up the Serial Monitor

  pinMode(25, OUTPUT);
  pinMode(26, OUTPUT);

  send_wakeup_message();

  //Configure the wake up source to use the RTC controller with external Pins PIN32 and PIN33
  esp_sleep_enable_ext1_wakeup(BUTTON_PIN_BITMASK, ESP_EXT1_WAKEUP_ANY_HIGH); //1 = High, 0 = Low

  //Go to sleep now
  Serial.println("Going to sleep now");
  esp_deep_sleep_start();
}

void loop(){
  //This is not going to be called
}
