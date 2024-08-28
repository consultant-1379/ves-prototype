package ericsson.mqtt.client.main;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;

public class Publisher {

	static final String FILE = "file_with_json_alarms.txt";
	
	/**
     * The main method.
     *
     * @param args the arguments
     */
    public static void main(String[] args) {
    	
    	String topic = "FM/Alarm";
    	String mqttBroker = "tcp://localhost:1818";
    	
        String clientId = "AlarmGenerator";
        FileReader input = null;
        
        try {
        	input = new FileReader(FILE);
        } catch (FileNotFoundException fnf){
        	System.out.println("Missing input file '"+ FILE + "'");
        	System.exit(0);
        }
        try {
        	MqttClient client = new MqttClient(mqttBroker, clientId);
        	MqttConnectOptions mqttConnOpts = new MqttConnectOptions();
        	mqttConnOpts.setCleanSession(false);
        	System.out.println("Connecting to broker: " + mqttBroker);
        	client.connect(mqttConnOpts);
        	System.out.println("Connected: "+ client.isConnected());        		
            BufferedReader in = new BufferedReader(input);
            String alarm = in.readLine();
            while (alarm != null) {
            	System.out.println("Publishing message: " + alarm);
            	MqttMessage message = new MqttMessage(alarm.getBytes());
            	message.setQos(1);
            	message.setRetained(false);
                client.publish(topic, message);
                System.out.println("Message published");
                alarm = in.readLine();
            }
            in.close();
            client.disconnect();
            System.out.println("Disconnected");
           
        } catch (MqttException me) {
            System.out.println("reason " + me.getReasonCode());
            System.out.println("msg " + me.getMessage());
            System.out.println("loc " + me.getLocalizedMessage());
            System.out.println("cause " + me.getCause());
            System.out.println("excep " + me);
            me.printStackTrace();          
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

