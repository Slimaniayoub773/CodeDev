<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Progress extends Model
{
    protected $fillable = ['utilisateur_id', 'course_id', 'completed_lessons'];

    protected $casts = [
        'completed_lessons' => 'array',  // Ensure completed_lessons is stored as an array
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
