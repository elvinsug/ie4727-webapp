<?php

class EmailHelper {
    private $smtpHost;
    private $smtpPort;
    private $smtpUsername;
    private $smtpPassword;
    private $fromEmail;
    private $fromName;

    public function __construct() {
        // Load SMTP settings from environment variables or use defaults
        $this->smtpHost = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
        $this->smtpPort = getenv('SMTP_PORT') ?: 587;
        $this->smtpUsername = getenv('SMTP_USERNAME') ?: '';
        $this->smtpPassword = getenv('SMTP_PASSWORD') ?: '';
        $this->fromEmail = getenv('SMTP_FROM_EMAIL') ?: 'no-reply@miona.com';
        $this->fromName = getenv('SMTP_FROM_NAME') ?: 'MIONA';
    }

    /**
     * Send an email using SMTP
     *
     * @param string $to Recipient email address
     * @param string $subject Email subject
     * @param string $message Email body (plain text or HTML)
     * @param bool $isHtml Whether the message is HTML (default: false)
     * @return bool True if email was sent successfully
     */
    public function sendEmail($to, $subject, $message, $isHtml = false) {
        // If SMTP is not configured, fall back to PHP mail()
        if (empty($this->smtpUsername) || empty($this->smtpPassword)) {
            return $this->sendWithPhpMail($to, $subject, $message, $isHtml);
        }

        try {
            // Create socket connection to SMTP server
            $socket = fsockopen(
                $this->smtpHost,
                $this->smtpPort,
                $errno,
                $errstr,
                30
            );

            if (!$socket) {
                error_log("SMTP connection failed: $errstr ($errno)");
                return $this->sendWithPhpMail($to, $subject, $message);
            }

            // Read server greeting
            $this->readResponse($socket);

            // Send EHLO command
            $this->sendCommand($socket, "EHLO " . gethostname());
            $this->readResponse($socket);

            // Start TLS if using port 587
            if ($this->smtpPort == 587) {
                $this->sendCommand($socket, "STARTTLS");
                $this->readResponse($socket);

                // Enable crypto
                stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);

                // Send EHLO again after STARTTLS
                $this->sendCommand($socket, "EHLO " . gethostname());
                $this->readResponse($socket);
            }

            // Authenticate
            $this->sendCommand($socket, "AUTH LOGIN");
            $this->readResponse($socket);

            $this->sendCommand($socket, base64_encode($this->smtpUsername));
            $this->readResponse($socket);

            $this->sendCommand($socket, base64_encode($this->smtpPassword));
            $response = $this->readResponse($socket);

            // Check if authentication failed
            if (strpos($response, '535') !== false) {
                error_log("SMTP authentication failed");
                fclose($socket);
                return false;
            }

            // Send MAIL FROM
            $this->sendCommand($socket, "MAIL FROM: <{$this->fromEmail}>");
            $this->readResponse($socket);

            // Send RCPT TO
            $this->sendCommand($socket, "RCPT TO: <{$to}>");
            $this->readResponse($socket);

            // Send DATA command
            $this->sendCommand($socket, "DATA");
            $this->readResponse($socket);

            // Build email headers and body
            $emailContent = "From: {$this->fromName} <{$this->fromEmail}>\r\n";
            $emailContent .= "To: {$to}\r\n";
            $emailContent .= "Subject: {$subject}\r\n";
            $emailContent .= "MIME-Version: 1.0\r\n";

            if ($isHtml) {
                $emailContent .= "Content-Type: text/html; charset=UTF-8\r\n";
            } else {
                $emailContent .= "Content-Type: text/plain; charset=UTF-8\r\n";
            }

            $emailContent .= "Content-Transfer-Encoding: 8bit\r\n";
            $emailContent .= "\r\n";
            $emailContent .= $message;
            $emailContent .= "\r\n.\r\n";

            // Send email content
            fputs($socket, $emailContent);
            $this->readResponse($socket);

            // Send QUIT command
            $this->sendCommand($socket, "QUIT");
            $this->readResponse($socket);

            fclose($socket);
            return true;

        } catch (Exception $e) {
            error_log("SMTP error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Fallback to PHP's mail() function
     */
    private function sendWithPhpMail($to, $subject, $message, $isHtml = false) {
        $headers = "MIME-Version: 1.0\r\n";

        if ($isHtml) {
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        } else {
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        }

        $headers .= "From: {$this->fromName} <{$this->fromEmail}>\r\n";

        if (function_exists('mail')) {
            return mail($to, $subject, $message, $headers);
        }

        return false;
    }

    /**
     * Send command to SMTP server
     */
    private function sendCommand($socket, $command) {
        fputs($socket, $command . "\r\n");
    }

    /**
     * Read response from SMTP server
     */
    private function readResponse($socket) {
        $response = '';
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) == ' ') {
                break;
            }
        }
        return $response;
    }
}
