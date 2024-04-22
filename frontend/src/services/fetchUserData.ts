const fetchUserData = async() => {
    try {
      const idToken = sessionStorage.getItem('idToken');
      if (!idToken) throw new Error('Authentication token not found.');
  
      const response = await fetch('/api/get-user-data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
  
      if (response.ok) {
        const userData = await response.json();
        return userData; // This contains the user data retrieved from Firestore
      } else {
        throw new Error(`Error fetching user data: ${response.statusText}`);
      }
    } catch (error) {
      console.error('fetchUserData error:', error);
    }
  }
  
export default fetchUserData;