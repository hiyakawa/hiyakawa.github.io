import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

public class Server {
    public static void main(String[] args)  {
        ServerSocket  serverSocket = null;
        try {
            serverSocket = new ServerSocket(8080);
        }
        catch (IOException e) {
            e.printStackTrace();
        }

        while (true) {
            try {
                assert serverSocket != null;
                Socket clientSocket = serverSocket.accept();
                HandlerRunnable runnable = new HandlerRunnable(clientSocket);
                Thread thread = new Thread(runnable);
                thread.start();
            }
            catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}