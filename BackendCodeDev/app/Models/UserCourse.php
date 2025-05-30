<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserCourse extends Model
{
    use HasFactory;

    protected $fillable = ['utilisateur_id', 'course_id', 'inscription_date', 'status'];

    // Define relationships to User and Course models
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}
