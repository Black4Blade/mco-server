require "socket"
require "openssl"
require "thread"

# SSL server

listeningPort = 443

server = TCPServer.new(listeningPort)
sslContext = OpenSSL::SSL::SSLContext.new
sslContext.cert = OpenSSL::X509::Certificate.new(File.open("./data/cert.pem"))
sslContext.key = OpenSSL::PKey::RSA.new(File.open("./data/private_key.pem"))
sslServer = OpenSSL::SSL::SSLServer.new(server, sslContext)

puts "Listening on port #{listeningPort}"

loop do
  connection = sslServer.accept
  Thread.new {
    begin
      while (lineIn = connection.gets)
        lineIn = lineIn.chomp

        # Log the request to the console for debugging
        STDERR.puts lineIn

        connection.puts "Hello!"
        connection.close       
      end
    rescue
      $stderr.puts $!
    end    
  }
end