<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Lesson;
use App\Models\Utilisateur;

class Course extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title', 
        'description', 
        'image', 
        'start_date', 
        'end_date', 
        'rating',
        'rating_count'  // Added missing field
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'rating' => 'float',
        'rating_count' => 'integer',
        'start_date' => 'datetime',  // Added proper casting for dates
        'end_date' => 'datetime',
    ];

    /**
     * Relationship with lessons
     */
    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    /**
     * Relationship with users
     */
    public function users()
    {
        return $this->belongsToMany(Utilisateur::class, 'user_courses')
                   ->withPivot('rating')  // Added to store individual ratings
                   ->withTimestamps();
    }

    /**
     * Add a new rating to the course
     *
     * @param int $newRating
     * @return array
     */
    public function addRating($newRating)
    {
        $newCount = $this->rating_count + 1;
        $newAverage = (($this->rating * $this->rating_count) + $newRating) / $newCount;

        $this->update([
            'rating' => $newAverage,
            'rating_count' => $newCount
        ]);

        return [
            'new_rating' => $newAverage,
            'rating_count' => $newCount
        ];
    }
}