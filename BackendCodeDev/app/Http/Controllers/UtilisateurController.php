<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Notifications\NewUserRegistered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class UtilisateurController extends Controller
{
    
    public function index()
    {
        return response()->json(Utilisateur::all());
    }

    public function store(Request $request)
    {
        

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:utilisateurs',
            'password' => 'required|min:6|confirmed',
            'role' => 'sometimes|in:user,admin',
        ]);

        $user = Utilisateur::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => bcrypt($validatedData['password']),
            'role' => $validatedData['role'] ?? 'user',
            'email_verified_at' => now(),
        ]);
        $user->setRememberToken(Str::random(60));
        $user->save();
         if ($user->role !== 'admin') {
            $adminUsers = Utilisateur::where('role', 'admin')->get();
            foreach ($adminUsers as $admin) {
                $admin->notify(new NewUserRegistered($user));
            }
        }
        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = Utilisateur::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('utilisateurs')->ignore($user->id)],
            'password' => 'sometimes|min:6|confirmed',
            'role' => 'sometimes|in:user,admin',
        ]);

        if ($request->has('password')) {
            $validatedData['password'] = bcrypt($request->password);
        }

        $user->update($validatedData);

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = Utilisateur::findOrFail($id);

        if (auth()->id() == $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }

    public function blocked(Request $req)
    {
        $isBlocked = filter_var($req->query('is_blocked'), FILTER_VALIDATE_BOOLEAN);
        $blocked = Utilisateur::where('is_blocked', $isBlocked)->get();
        return response()->json($blocked);
    }

    public function toggleBlock($id)
{
    try {
        $user = Utilisateur::findOrFail($id);

        if (auth()->id() == $user->id) {
            return response()->json([
                'message' => 'You cannot block yourself.'
            ], 403);
        }

        $user->update(['is_blocked' => !$user->is_blocked]);

        return response()->json([
            'message' => $user->is_blocked ? 'User blocked successfully' : 'User unblocked successfully',
            'user' => $user
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error toggling block status',
            'error' => $e->getMessage()
        ], 500);
    }
}
    public function updateProfile(Request $request)
{
    $user = $request->user();

    $rules = [
        'name' => 'required|string|max:255',
        'email' => ['required', 'email', Rule::unique('utilisateurs')->ignore($user->id)],
    ];

    // Only validate passwords if they're provided
    if ($request->has('newPassword')) {
        $rules['oldPassword'] = ['required', function ($attribute, $value, $fail) use ($user) {
            if (!Hash::check($value, $user->password)) {
                $fail('The current password is incorrect.');
            }
        }];
        $rules['newPassword'] = 'required|min:6|different:oldPassword';
    }

    $validated = $request->validate($rules);

    // Update user
    $user->name = $validated['name'];
    $user->email = $validated['email'];

    if (isset($validated['newPassword'])) {
        $user->password = Hash::make($validated['newPassword']);
    }

    $user->save();

    return response()->json($user);
}
public function getBlockedUsers(Request $request)
{
    try {
        $isBlocked = $request->query('is_blocked', 'true') === 'true';
        $blockedUsers = Utilisateur::where('is_blocked', $isBlocked)->get();
        
        return response()->json($blockedUsers);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error fetching blocked users',
            'error' => $e->getMessage()
        ], 500);
    }
}
}
