<?php

namespace App\Http\Controllers;

use App\Mail\PasswordResetMail;
use App\Models\Utilisateur;
use App\Notifications\NewUserRegistered;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:utilisateurs',
            'password' => 'required|string|min:6',
        ]);

        $user = Utilisateur::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'email_verified_at' => now(), 
        ]);

        $user->setRememberToken(Str::random(60));
        $user->save();
        $adminUsers = Utilisateur::where('role', 'admin')->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new NewUserRegistered($user));
        }
        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if ($user->is_blocked) {
            return response()->json(['message' => 'Your account is blocked'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
            'role' => $user->role,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }public function forgotPassword(Request $request)
{
    try {
        $request->validate(['email' => 'required|email']);
        
        $user = Utilisateur::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json(['message' => 'If this email exists, a reset link has been sent'], 200);
        }

        $token = Str::random(60);
        
        // Add database error handling
        try {
            DB::table('password_resets')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token' => Hash::make($token),
                    'created_at' => Carbon::now()
                ]
            );
        } catch (\Exception $dbException) {
            \Log::error('Database error in password reset: ' . $dbException->getMessage());
            throw new \Exception('Failed to store reset token');
        }

        $resetLink = config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);
        
        // Add mail sending error handling
        try {
            Mail::to($user->email)->send(new PasswordResetMail($resetLink));
        } catch (\Exception $mailException) {
            \Log::error('Mail sending error: ' . $mailException->getMessage());
            throw new \Exception('Failed to send reset email');
        }
        
        return response()->json(['message' => 'If this email exists, a reset link has been sent']);
        
    } catch (\Exception $e) {
        \Log::error('Forgot Password Error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Failed to process password reset request',
            'error' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed'
        ]);

        // Validate token
        $record = DB::table('password_resets')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Invalid token'], 400);
        }

        // Check if token is expired (1 hour)
        if (Carbon::parse($record->created_at)->addHour()->isPast()) {
            return response()->json(['message' => 'Token has expired'], 400);
        }

        // Update password
        $user = Utilisateur::where('email', $request->email)->first();
        $user->password = bcrypt($request->password);
        $user->save();

        // Delete token
        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password has been reset successfully']);
    }
}

