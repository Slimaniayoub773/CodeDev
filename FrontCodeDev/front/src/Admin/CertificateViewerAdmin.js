import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import Sidebar from './Sidebar';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    position: 'relative'
  },
  container: {
    border: '15px solid #1a365d',
    padding: 0,
    height: '100%',
    position: 'relative'
  },
  header: {
    backgroundColor: '#1a365d',
    color: 'white',
    padding: 20,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 15
  },
  body: {
    padding: 40,
    textAlign: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1a365d'
  },
  text: {
    fontSize: 18,
    marginBottom: 20
  },
  user: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: '30px 0',
    color: '#2d3748'
  },
  course: {
    fontSize: 20,
    fontStyle: 'italic',
    marginBottom: 30
  },
  date: {
    fontSize: 16,
    marginTop: 40
  },
  signature: {
    marginTop: 60,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  signatureLine: {
    width: 300,
    borderTop: '1px solid #2d3748',
    textAlign: 'center',
    paddingTop: 10
  },
  watermark: {
    position: 'absolute',
    opacity: 0.1,
    fontSize: 120,
    color: '#1a365d',
    transform: 'rotate(-45deg)',
    left: 150,
    top: 200,
    zIndex: 0
  }
});

const MyDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.watermark}>CodeDev</Text>
        <View style={styles.header}>
          <Image src="/trans_bg.png" style={styles.logo} />
          <Text>Certificat de Réussite</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.text}>Ce certificat est décerné à</Text>
          <Text style={styles.user}>{data.certification.utilisateur.name}</Text>
          <Text style={styles.text}>pour avoir complété avec succès le cours</Text>
          <Text style={styles.course}>"{data.certification.course.title}"</Text>
          <Text style={styles.date}>Délivré le: {new Date(data.certification.issue_date).toLocaleDateString()}</Text>
          
          <View style={styles.signature}>
            <View style={styles.signatureLine}>
              <Text>Directeur des Études</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

// Main Component
export default function CertificateViewerAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null); // Add this line to initialize state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
  try {
    const response = await axios.get(`/api/certifications/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    setCertData(response.data);
  } catch (err) {
    setError(err.response?.data?.message || 'Error loading certificate');
  } finally {
    setLoading(false);
  }
};

    fetchCertificate();
  }, [id]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) return (
    <div className="ml-0 md:ml-64 p-8 text-center py-20">
      Loading certificate...
    </div>
  );
  
  if (error) return (
    <div className="ml-0 md:ml-64 p-8 text-center py-20 text-red-500">
      {error}
    </div>
  );
  
  if (!certData) return (
    <div className="ml-0 md:ml-64 p-8 text-center py-20">
      Certificate not found
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 ml-0 md:ml-64 transition-all duration-300">
        {/* Mobile header */}
        <div className="md:hidden bg-blue-900 text-white p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <div className="flex items-center">
            <img src="/trans_bg.png" alt="Logo" className="h-8 w-8 mr-2" />
            <span className="font-bold">CodeDev</span>
          </div>
          <div className="w-6"></div> {/* Spacer for alignment */}
        </div>

        <div className="p-4 sm:p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* PDF Download Button */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-4 text-right">
              <PDFDownloadLink 
                document={<MyDocument data={certData} />} 
                fileName={`certificate-${certData.certification.utilisateur.name.replace(/\s+/g, '-')}-${certData.certification.course.title.replace(/\s+/g, '-')}.pdf`}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg flex items-center justify-center gap-2 w-fit ml-auto hover:bg-blue-50 transition-all shadow-md hover:shadow-lg"
              >
                {({ loading }) => (
                  <>
                    <Download size={20} />
                    {loading ? 'Generating PDF...' : 'Download Certificate'}
                  </>
                )}
              </PDFDownloadLink>
            </div>

            {/* Certificate Display (HTML version) */}
            <div className="p-6 sm:p-10">
              <div className="border-8 border-blue-900 p-2 relative overflow-hidden">
                {/* Gold decorative elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                <div className="absolute right-0 top-0 h-full w-2 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-blue-900 text-7xl sm:text-8xl font-bold opacity-10 rotate-45">CodeDev</span>
                </div>
                
                {/* Header with logo */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-6 text-center flex items-center justify-center">
                  <img 
                    src="/trans_bg.png" 
                    alt="Logo" 
                    className="h-16 w-16 mr-4 object-contain" 
                    style={{ filter: 'brightness(0) invert(1)' }} 
                  />
                  <h1 className="text-2xl sm:text-3xl font-bold">Certificat de Réussite</h1>
                </div>
                
                {/* Certificate body */}
                <div className="py-8 px-4 sm:px-10 text-center relative z-10">
                  <p className="text-lg sm:text-xl mb-6 text-gray-700">Ce certificat est décerné à</p>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">
                    {certData.certification.utilisateur.name}
                  </h2>
                  <p className="text-lg sm:text-xl mb-6 text-gray-700">pour avoir complété avec succès le cours</p>
                  <p className="text-2xl sm:text-3xl italic text-gray-800 mb-8 font-semibold">
                    "{certData.certification.course.title}"
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 mt-12">
                    Délivré le: {new Date(certData.certification.issue_date).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  
                  {/* Single Signature */}
                  <div className="flex justify-center mt-16 pt-8 border-t border-gray-300">
                    <div className="w-64 text-center">
                      <div className="border-t-2 border-gray-400 pt-4 mx-auto">
                        <p className="font-medium text-gray-700">Directeur des Études</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
}