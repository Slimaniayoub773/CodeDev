  import { useEffect, useState } from "react";
  import { useForm } from "react-hook-form";
  import axios from "axios";
  import { toast } from "react-toastify";
  import Modal from "react-modal";
  import Sidebar from "./Sidebar";

  axios.defaults.baseURL = 'http://localhost:8000';
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  Modal.setAppElement("#root");

  export default function ProgressManagement() {
      const [progressList, setProgressList] = useState([]);
      const [users, setUsers] = useState([]);
      const [courses, setCourses] = useState([]);
      const [editingProgress, setEditingProgress] = useState(null);
      const [modalIsOpen, setModalIsOpen] = useState(false);
      const { register, handleSubmit, reset, formState: { errors }, getValues } = useForm();

      // Fetch all progress, users, and courses from the backend
      const fetchProgressData = async () => {
          try {
              const [progressResponse, usersResponse, coursesResponse] = await Promise.all([
                  axios.get("/api/progress"),
                  axios.get("/api/utilisateurs"),
                  axios.get("/api/courses")
              ]);
              setProgressList(progressResponse.data);
              setUsers(usersResponse.data);
              setCourses(coursesResponse.data);
          } catch (error) {
              console.error("Error fetching data:", error);
              toast.error("Erreur lors de la récupération des données");
          }
      };

      useEffect(() => {
          fetchProgressData();
      }, []);

      const getCsrfToken = async () => {
          try {
              await axios.get('http://localhost:8000/sanctum/csrf-cookie');
          } catch (error) {
              console.error("Error getting CSRF token:", error);
          }
      };

      const onSubmit = async (data) => {
          try {
              await getCsrfToken();

              if (editingProgress) {
                  await axios.put(`/api/progress/${editingProgress.id}`, data, { withCredentials: true });
                  toast.success("Progrès mis à jour !");
              } else {
                  await axios.post("/api/progress", data, { withCredentials: true });
                  toast.success("Progrès ajouté !");
              }

              fetchProgressData();
              setModalIsOpen(false);
              setEditingProgress(null);
          } catch (error) {
              console.error("Error details:", error.response.data);
              toast.error("Erreur lors de l'ajout ou de la mise à jour du progrès");
          }
      };

      const handleDelete = async (id) => {
          try {
              await axios.delete(`/api/progress/${id}`);
              toast.success("Progrès supprimé !");
              fetchProgressData();
          } catch (error) {
              toast.error("Erreur lors de la suppression");
          }
      };

      return (
          <div className="flex h-screen bg-gray-50">
              <Sidebar />
              <div className="p-8 w-full max-w-7xl mx-auto">
                  <h1 className="text-3xl font-semibold text-gray-900 mb-6">Gestion des Progrès</h1>
                  <button onClick={() => setModalIsOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 mb-6">
                      Ajouter un progrès
                  </button>
                  <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                      <table className="min-w-full table-auto text-sm text-gray-500 border border-gray-300">
                          <thead className="bg-blue-500 text-white">
                              <tr>
                                  <th className="py-3 px-6 text-left border-b border-gray-300">Utilisateur</th>
                                  <th className="py-3 px-6 text-left border-b border-gray-300">Cours</th>
                                  <th className="py-3 px-6 text-left border-b border-gray-300">Leçons Complétées</th>
                                  <th className="py-3 px-6 text-left border-b border-gray-300">Actions</th>
                              </tr>
                          </thead>
                          <tbody>
                              {progressList.map((progress) => (
                                  <tr key={progress.id} className="hover:bg-gray-50">
                                      <td className="py-3 px-6 border-b border-gray-300">{progress.utilisateur ? progress.utilisateur.name : "Non assigné"}</td>
                                      <td className="py-3 px-6 border-b border-gray-300">{progress.course ? progress.course.title : "Non assigné"}</td>
                                      <td className="py-3 px-6 border-b border-gray-300">{progress.completed_lessons.join(", ")}</td>
                                      <td className="py-3 px-6">
                                          <button onClick={() => { setEditingProgress(progress); setModalIsOpen(true); }} className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-yellow-600 transition duration-300">
                                              Modifier
                                          </button>
                                          <button onClick={() => handleDelete(progress.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300">
                                              Supprimer
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* Modal for Adding or Editing Progress */}
              <Modal isOpen={modalIsOpen} onRequestClose={() => { setModalIsOpen(false); setEditingProgress(null); reset(); }} className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto mt-20">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">{editingProgress ? "Modifier un progrès" : "Ajouter un progrès"}</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                          <label className="text-sm font-medium text-gray-700">Utilisateur</label>
                          <select {...register("utilisateur_id", { required: "L'utilisateur est obligatoire" })} className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="">Sélectionner un utilisateur</option>
                              {users.map((utilisateur) => (
                                  <option key={utilisateur.id} value={utilisateur.id}>{utilisateur.name}</option>
                              ))}
                          </select>
                          {errors.utilisateur_id && <p className="text-red-500 text-sm">{errors.utilisateur_id.message}</p>}
                      </div>
                      <div>
                          <label className="text-sm font-medium text-gray-700">Sélectionner un Cours</label>
                          <select {...register("course_id", { required: "Le cours est obligatoire" })} className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="">Sélectionner un cours</option>
                              {courses.map((course) => (
                                  <option key={course.id} value={course.id}>{course.title}</option>
                              ))}
                          </select>
                          {errors.course_id && <p className="text-red-500 text-sm">{errors.course_id.message}</p>}
                      </div>
                      <div>
                          <label className="text-sm font-medium text-gray-700">Leçons Complétées</label>
                          <textarea {...register("completed_lessons", { required: "Les leçons complétées sont obligatoires" })} className="border-2 border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Séparer les leçons par des virgules" defaultValue={editingProgress?.completed_lessons.join(", ") || ""}></textarea>
                          {errors.completed_lessons && <p className="text-red-500 text-sm">{errors.completed_lessons.message}</p>}
                      </div>
                      <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">{editingProgress ? "Modifier" : "Ajouter"}</button>
                  </form>
              </Modal>
          </div>
      );
  }
    