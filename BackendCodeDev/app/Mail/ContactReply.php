<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\ContactMessage; // Add this import

class ContactReply extends Mailable
{
    use Queueable, SerializesModels;

    public $contactMessage; // Renamed from $message to avoid confusion
    public $replyContent;

    public function __construct(ContactMessage $contactMessage, $replyContent)
    {
        $this->contactMessage = $contactMessage;
        $this->replyContent = $replyContent;
    }

    public function build()
    {
        return $this->subject('Réponse à votre message de contact')
                    ->view('emails.contact-reply')
                    ->with([
                        'contact' => $this->contactMessage, // Changed from 'message'
                        'reply' => $this->replyContent
                    ]);
    }
}   