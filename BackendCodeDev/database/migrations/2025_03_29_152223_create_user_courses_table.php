<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
            Schema::create('user_courses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('utilisateur_id')->constrained('utilisateurs')->onDelete('cascade');
                $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
                $table->date('inscription_date')->nullable();
                $table->enum('status', ['En attente', 'Complété', 'Annulé'])->default('En attente'); 
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();
            });
        
    }

    public function down(): void
    {
        Schema::dropIfExists('user_courses');
    }
};
