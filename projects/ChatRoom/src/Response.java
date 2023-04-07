import java.io.*;
import java.net.Socket;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;

public class Response {
    private OutputStream os_;
    private PrintWriter printWriter_;
    private Socket clientSocket_;
    private String fileName_;
    private File file_;
    private HashMap<String, String> requestHeader_;
    private String webSocketAccept_;

    public Response(Socket clientSocket, String fileName,
                    HashMap<String, String> requestHeader) throws IOException {
        clientSocket_ = clientSocket;
        fileName_ = fileName;
        requestHeader_ = requestHeader;
    }

    public void sendResponseHeader()
            throws IOException, NoSuchAlgorithmException, InterruptedException {
        if (fileName_.equals("/")) {
            fileName_ = "/404NotFound.html";
        }

        fileName_ = "resources" + fileName_;
        file_ = new File(fileName_);
        String result;

        if (file_.exists()) {
            result = " 200 success";
        }
        else {
            fileName_ = "resources/404NotFound.html";
            file_ = new File(fileName_);
            result = " 404 not found";
        }

        try {
            os_ = clientSocket_.getOutputStream();
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }

        printWriter_ = new PrintWriter(os_);

        if (requestHeader_.containsKey("Sec-WebSocket-Key")) {
            acceptSecWebSocket();
            handshakeResponse();
        }
        else {
            printWriter_.println("HTTP/1.1" + result);
            String extension = fileName_.substring(fileName_.lastIndexOf('.') + 1);
            if (extension.equals("png")) {
                File file = new File(fileName_);
                FileInputStream fis = new FileInputStream(file);
                byte[] data = new byte[(int) file.length()];
                fis.read(data);
                fis.close();

                DataOutputStream binaryOut = new DataOutputStream(clientSocket_.getOutputStream());
                binaryOut.writeBytes("HTTP/1.0 200 OK\r\n");
                binaryOut.writeBytes("Content-Type: image/png\r\n");
                binaryOut.writeBytes("Content-Length: " + data.length);
                binaryOut.writeBytes("\r\n\r\n");
                binaryOut.write(data);

                binaryOut.close();
            }
            else {
                printWriter_.println("Content-Type: text/" + extension);
                printWriter_.println("Content-Length: " + file_.length());
                printWriter_.println("\n");
            }
            printWriter_.flush();
            sendResponseBody();
        }
    }

    public void sendResponseBody() {
        try {
            InputStream fileStream = new FileInputStream(file_);
            fileStream.transferTo(os_);
            fileStream.close();
        }
        catch (IOException ex) {}
        printWriter_.flush();
    }

    public void acceptSecWebSocket()
            throws NoSuchAlgorithmException, UnsupportedEncodingException {
        String SecWebSocketKey = " ";
        if (requestHeader_.containsKey("Sec-WebSocket-Key") ||
                requestHeader_.containsKey("Connection")) {
            SecWebSocketKey = requestHeader_.get("Sec-WebSocket-Key");
        }

        String magicKey = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
        SecWebSocketKey = SecWebSocketKey + magicKey;

        MessageDigest message_digest = MessageDigest.getInstance("SHA-1");
        byte[] hashed = message_digest.digest(SecWebSocketKey.getBytes("UTF-8"));

        webSocketAccept_ = Base64.getEncoder().encodeToString(hashed);
    }

    public void handshakeResponse() {
        printWriter_.print("HTTP/1.1 101 Switching Protocols\r\n");
        printWriter_.print("Upgrade: websocket\r\n");
        printWriter_.print("Connection: Upgrade\r\n");
        printWriter_.print("Sec-WebSocket-Accept:" + webSocketAccept_ + "\r\n\r\n");
        printWriter_.flush();
    }
}