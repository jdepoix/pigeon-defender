#include <Arduino.h>
#include <PubSubClient.h>
#include <ESP8266WiFi.h>
#include "FS.h"

//Wifi access point ssid
const char* ssid = "{SSID}";
//Wifi password
const char* password = "{PASSWORD}";

//MQTT server url
const char* mqtt_server = "{MQTT SERVER}";
//MQTT port
const unsigned int mqtt_port = 8883;
//MQTT client id
const char* client_id = "Sensor";

//TSL enabled wifi client
WiFiClientSecure espClient;
//MQTT client
PubSubClient client(espClient);

//empty message
const char* msg = "{}";

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
Method to send an activation or deactivation message to the AWS MQTT broker to the device specific sensors topic.
*/
bool sendMessage()
{
    bool success = false;
    Serial.println("Sending message");

    setup_wifi();
    loadCertificates();
    reconnect();

    //Try 10 times to send
    for (int i = 0; i < 10; i++)
    {
        success = client.publish("sensors/{CERTIFICATE FINGERPRINT}", msg);

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


void setup()
{
    pinMode(BUILTIN_LED, OUTPUT); //Initialize the BUILTIN_LED pin as an output
    Serial.begin(115200);
    delay(1000); //Take some time to open up the Serial Monitor

    if(!setup_wifi())
    {
        ESP.deepSleep(0);
    }
    if(!loadCertificates())
    {
        ESP.deepSleep(0);
    }
    client.setServer(mqtt_server, mqtt_port);
    if(!reconnect())
    {
        ESP.deepSleep(0);
    }
    
    sendMessage();
    client.loop(); //run MQTT client loop once to process message

    client.disconnect();
    ESP.deepSleep(0);
}

void loop()
{
    //This is not going to be called
}
