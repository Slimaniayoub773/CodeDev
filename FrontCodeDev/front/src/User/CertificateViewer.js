import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import Navbar from './Nav';
import Footer from './Footer';
import CodeDevLoadingScreen from './CodeDevLoadingScreen';

// PDF Styles
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

// PDF Document Component
const MyDocument = ({ certification }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.watermark}>CodeDev</Text>
        <View style={styles.header}>
          <Image src="/trans_bg.png" style={styles.logo} />
          <Text>Certificate of Completion</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.text}>This certificate is awarded to</Text>
          <Text style={styles.user}>{certification?.utilisateur?.name || 'Student Name'}</Text>
          <Text style={styles.text}>for successfully completing the course</Text>
          <Text style={styles.course}>"{certification?.course?.title || 'Course Title'}"</Text>
          <Text style={styles.date}>Issued on: {new Date(certification?.issue_date || new Date()).toLocaleDateString()}</Text>
          
          <View style={styles.signature}>
            <View style={styles.signatureLine}>
              <Text>Director of Studies</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

// Main Component
export default function CertificateViewer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log('Using token:', token);
        
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `/api/certifications/by-course/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('API Response:', response.data);
        
        if (!response.data.certification) {
          throw new Error('Certificate not found or not earned yet');
        }

        setCertData({ certification: response.data.certification });
      } catch (err) {
        console.error('Full error object:', err);
        console.error('Error response data:', err.response?.data);
        setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Certificate not available');
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId) {
      fetchCertificate();
    }
  }, [courseId]);

  if (loading) {
     return <CodeDevLoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 text-center py-20">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Certificate Not Available
          </h2>
          <p className="text-gray-600 mb-6">
            {error.includes("earn") ? (
              <>
                You haven't earned a certificate for this course yet. <br />
                Complete the quiz with a passing score to unlock it.
              </>
            ) : (
              error
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate(`/course/${courseId}/quiz`)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Take Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!certData?.certification) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 text-center py-20">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
          <XCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Certificate Data Missing</h2>
          <p className="text-gray-600 mb-6">The certificate data could not be loaded</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { certification } = certData;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* PDF Download Button */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-4 text-right">
            <PDFDownloadLink 
              document={<MyDocument certification={certification} />} 
              fileName={`certificate-${certification.utilisateur?.name?.replace(/\s+/g, '-') || 'certificate'}-${certification.course?.title?.replace(/\s+/g, '-') || 'course'}.pdf`}
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
                <h1 className="text-2xl sm:text-3xl font-bold">Certificate of Completion</h1>
              </div>
              
              {/* Certificate body */}
              <div className="py-8 px-4 sm:px-10 text-center relative z-10">
                <p className="text-lg sm:text-xl mb-6 text-gray-700">This certificate is awarded to</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">
                  {certification.utilisateur?.name || 'Student Name'}
                </h2>
                <p className="text-lg sm:text-xl mb-6 text-gray-700">for successfully completing the course</p>
                <p className="text-2xl sm:text-3xl italic text-gray-800 mb-8 font-semibold">
                  "{certification.course?.title || 'Course Title'}"
                </p>
                <p className="text-sm sm:text-base text-gray-600 mt-12">
                  Issued on: {new Date(certification.issue_date || new Date()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                
                {/* Single Signature */}
                <div className="flex justify-center mt-16 pt-8 border-t border-gray-300">
                  <div className="w-64 text-center">
                    <div className="border-t-2 border-gray-400 pt-4 mx-auto">
                      <p className="font-medium text-gray-700">Director of Studies</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}