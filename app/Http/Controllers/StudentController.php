<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    // GET /api/students
    public function index()
    {
        return response()->json(Student::all(), 200);
    }

    // POST /api/students
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_number' => 'required|string|max:20|unique:students,student_number',
            'first_name'     => 'required|string|max:100',
            'last_name'      => 'required|string|max:100',
            'email'          => 'required|email|unique:students,email',
            'course'         => 'required|string|max:100',
            'year_level'     => 'required|integer|between:1,6',
        ]);

        $student = Student::create($validated);

        return response()->json([
            'message' => 'Student created successfully',
            'data'    => $student,
        ], 201);
    }

    // GET /api/students/{id}
    public function show(Student $student)
    {
        return response()->json($student, 200);
    }

    // PUT /api/students/{id}
    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'student_number' => ['required', 'string', 'max:20',
                Rule::unique('students', 'student_number')->ignore($student->id)],
            'first_name'     => 'required|string|max:100',
            'last_name'      => 'required|string|max:100',
            'email'          => ['required', 'email',
                Rule::unique('students', 'email')->ignore($student->id)],
            'course'         => 'required|string|max:100',
            'year_level'     => 'required|integer|between:1,6',
        ]);

        $student->update($validated);

        return response()->json([
            'message' => 'Student updated successfully',
            'data'    => $student,
        ], 200);
    }

    // DELETE /api/students/{id}
    public function destroy(Student $student)
    {
        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully',
        ], 200);
    }
}