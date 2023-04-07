import java.io.IOException;
import java.io.InputStream;
import java.net.Socket;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Scanner;

public class Request {
    private String fileName_;
    private InputStream inputStream_;
    private Socket clientSocket_;
    private String inputLine_;
    private Scanner scanner_;
    private HashMap<String, String> requestHeader_;

    public Request(Socket clientSocket) {
        clientSocket_ = clientSocket;
    }

    public String getFileName() throws IOException {
        inputStream_ = clientSocket_.getInputStream();
        scanner_ = new Scanner(inputStream_);
        inputLine_ = scanner_.nextLine();

        String[] inputs = inputLine_.split(" ");
        fileName_ = inputs[1];
        return fileName_;
    }

    public HashMap<String, String> getHeaderBody() throws NoSuchAlgorithmException {
        inputLine_ = scanner_.nextLine();
        requestHeader_ = new HashMap<>();
        while (! inputLine_.equals("")) {
            String[] inputs = inputLine_.split(": ");
            requestHeader_.put(inputs[0], inputs[1]);
            inputLine_ = scanner_.nextLine();
        }
        System.out.println(requestHeader_);

        return requestHeader_;
    }
}