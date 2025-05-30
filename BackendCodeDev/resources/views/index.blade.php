<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
    .swiper-slide img {
        width: 100%;
        height: 400px;
        object-fit: cover; /* تأكد من تغطية الصورة بالكامل */
        border-radius: 10px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    }
</style>

</head>
<body>
@extends('app')

@section('content')
<div class="container mx-auto py-10">
    <h2 class="text-3xl font-bold text-center mb-6">Our Courses</h2>

    <div class="swiper mySwiper">
        <div class="swiper-wrapper">
            @foreach ($courses as $course)
                <div class="swiper-slide bg-white shadow-md rounded-lg overflow-hidden">
                <img src="{{ asset('storage/' . $course->image) }}" 
     alt="{{ $course->title }}" 
     class="rounded-lg shadow-lg w-full h-[400px] object-cover">

                    <div class="p-4">
                        <h3 class="text-xl font-semibold">{{ $course->title }}</h3>
                        <p class="text-gray-600">{{ Str::limit($course->description, 100) }}</p>
                    </div>
                </div>
            @endforeach
        </div>
        
        <!-- أزرار التنقل -->
        <div class="swiper-button-next"></div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-pagination"></div>
    </div>
</div>

<!-- تضمين Swiper.js -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>

<script>
    document.addEventListener("DOMContentLoaded", function () {
        var swiper = new Swiper(".mySwiper", {
            slidesPerView: 1, // عرض شريحة واحدة فقط في كل مرة
            spaceBetween: 10, // المسافة بين الشرائح
            autoplay: {
                delay: 3000, // تغيير الشريحة كل 3 ثوانٍ
                disableOnInteraction: false, // الاستمرار بعد التفاعل
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            loop: {{ count($courses) > 1 ? 'true' : 'false' }}, // تعطيل loop إذا كان هناك شريحة واحدة فقط
        });
    });
</script>
@endsection

</body>
</html>