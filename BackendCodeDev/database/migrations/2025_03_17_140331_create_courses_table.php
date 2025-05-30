    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration {
        public function up(): void
        {
            Schema::create('courses', function (Blueprint $table) {
                $table->id(); 
                $table->string('title'); 
                $table->text('description');
                $table->text('image');
                $table->date('start_date')->nullable(); 
                $table->date('end_date')->nullable();
                $table->float('rating')->default(0);
                $table->integer('rating_count')->default(0);
                $table->timestamps(); 
            });
        }

        public function down(): void
        {
            Schema::dropIfExists('courses');
        }
    };
