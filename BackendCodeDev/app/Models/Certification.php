<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certification extends Model
{
    use HasFactory;

    protected $fillable = [
    'utilisateur_id', 
    'course_id',
    'score',
    'issue_date'
];
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    
    }
}
