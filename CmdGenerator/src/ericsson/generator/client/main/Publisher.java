package ericsson.generator.client.main;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.OutputStreamWriter;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;
import java.util.Scanner;

public class Publisher {

	static final String FILE = "file_with_json_command.txt";
	static String vesIpAddress;
	static String vesPort;


	 // HTTP POST request
 	public static void sendPost(String command) throws Exception {
 		 try {
             URL url = new URL ("http://"+vesIpAddress+":"+vesPort+"/testControl/v3/commandList");
             String encoding = Base64.getEncoder().encodeToString(("ves_mediator:1234").getBytes());

             HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
             urlConnection.setRequestMethod("POST");
             urlConnection.setDoOutput(true);
             urlConnection.setRequestProperty  ("Authorization", "Basic " + encoding);
             // Writing the post data to the HTTP request body
             BufferedWriter httpRequestBodyWriter = new BufferedWriter(new OutputStreamWriter(urlConnection.getOutputStream()));
             httpRequestBodyWriter.write(command);
             httpRequestBodyWriter.close();

             // Reading from the HTTP response body
             Scanner httpResponseScanner = new Scanner(urlConnection.getInputStream());
             while(httpResponseScanner.hasNextLine()) {
                 System.out.println("Response: " + httpResponseScanner.nextLine());
             }
             httpResponseScanner.close();

         } catch(ConnectException e) {
        	 System.out.println("Connection error URL: http://"+vesIpAddress+":"+vesPort+"/testControl/v3/commandList");
         } catch(Exception e) {
             e.printStackTrace();
         }

 	}

	/**
     * The main method.
     *
     * @param args the arguments
     */
    public static void main(String[] args) {

    	FileReader input = null;

    	try {
    		vesIpAddress = args[0];
    		vesPort = args[1];
    	} catch (ArrayIndexOutOfBoundsException e){
    		System.out.println("Missing arguments vesIpAddress and/or vesPort. Using defaults: vesIpAddress = 127.0.0.1 and vesPort = 30000");
        	vesIpAddress = "127.0.0.1";
            vesPort = "30000";
    	}

        try {
        	input = new FileReader(FILE);
        } catch (FileNotFoundException fnf){
        	System.out.println("Missing input file '"+ FILE + "'");
        	System.exit(0);
        }
        try {
        	BufferedReader in = new BufferedReader(input);
            String cmd = in.readLine();
            while (cmd != null) {
            	System.out.println("Publishing message: " + cmd);
            	sendPost(cmd);
            	cmd = in.readLine();
            }
            in.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

