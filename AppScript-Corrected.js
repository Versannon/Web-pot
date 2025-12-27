const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

// Helper function to get sheet by name
function getSheet(sheetName) {
  return SPREADSHEET.getSheetByName(sheetName);
}

// Helper function to get setting value
function getSetting(settingName) {
  const settingsSheet = getSheet('Settings Sheet');
  const data = settingsSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === settingName) {
      return data[i][1];
    }
  }
  return null;
}

// Handle POST requests - Main form submission handler
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const formType = data.formType;
    
    let response = { status: 'error', message: 'Invalid form type' };
    
    // Route to appropriate handler based on form type
    switch(formType) {
      case 'register':
        response = handleUserRegistration(data);
        break;
      case 'login':
        response = handleUserLogin(data);
        break;
      case 'order':
        response = handleOrderSubmission(data);
        break;
      case 'contact':
        response = handleContactInquiry(data);
        break;
      default:
        response = { status: 'error', message: 'Unknown form type' };
    }
    
    const output = ContentService.createTextOutput(JSON.stringify(response));
    output.setMimeType(ContentService.MimeType.JSON);
    output.setHeader("Access-Control-Allow-Origin", "*");
    output.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    output.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return output;
  } catch(error) {
    const output = ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    output.setHeader("Access-Control-Allow-Origin", "*");
    output.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    output.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return output;
  }
}

// Handle user registration
function handleUserRegistration(data) {
  try {
    const usersSheet = getSheet('Users Sheet');
    const values = usersSheet.getDataRange().getValues();
    
    // Check if user already exists
    for (let i = 1; i < values.length; i++) {
      if (values[i][2] === data.email) { // Column C is Email
        return { status: 'error', message: 'User already exists' };
      }
    }
    
    // Add new user
    const timestamp = new Date();
    usersSheet.appendRow([
      timestamp, // Column A: Date
      data.name, // Column B: Name
      data.email, // Column C: Email
      data.password, // Column D: Password
      'active', // Column E: Status
      timestamp // Column F: Created
    ]);
    
    return { status: 'success', message: 'User registered successfully' };
  } catch(error) {
    return { status: 'error', message: error.toString() };
  }
}

// Handle user login (validation)
function handleUserLogin(data) {
  try {
    const usersSheet = getSheet('Users Sheet');
    const values = usersSheet.getDataRange().getValues();
    
    // Find user and validate password
    for (let i = 1; i < values.length; i++) {
      if (values[i][2] === data.email) { // Column C is Email
        if (values[i][3] === data.password) { // Column D is Password
          return { 
            status: 'success', 
            message: 'Login successful',
            user: {
              name: values[i][1],
              email: values[i][2],
              status: values[i][4]
            }
          };
        } else {
          return { status: 'error', message: 'Invalid password' };
        }
      }
    }
    
    return { status: 'error', message: 'user_not_found' };
  } catch(error) {
    return { status: 'error', message: error.toString() };
  }
}

// Handle order submission
function handleOrderSubmission(data) {
  try {
    const ordersSheet = getSheet('Orders Sheet');
    const timestamp = new Date();
    
    // Generate Order ID
    const orderId = 'ORD-' + Date.now();
    
    ordersSheet.appendRow([
      timestamp, // Column A: Date
      orderId, // Column B: Order ID
      data.name, // Column C: Name
      data.email, // Column D: Email
      data.phone, // Column E: Phone
      data.service, // Column F: Service
      data.amount || 0, // Column G: Amount
      'pending', // Column H: Status
      data.details || '', // Column I: Details
      'No' // Column J: Paid
    ]);
    
    return { 
      status: 'success', 
      message: 'Order submitted successfully',
      orderId: orderId
    };
  } catch(error) {
    return { status: 'error', message: error.toString() };
  }
}

// Handle contact inquiry
function handleContactInquiry(data) {
  try {
    const contactSheet = getSheet('Contact_Inquires Sheet');
    const timestamp = new Date();
    
    contactSheet.appendRow([
      timestamp, // Column A: Date
      data.name, // Column B: Name
      data.email, // Column C: Email
      data.phone, // Column D: Phone
      data.message, // Column E: Message
      'new' // Column F: Status
    ]);
    
    return { 
      status: 'success', 
      message: 'Contact inquiry submitted successfully' 
    };
  } catch(error) {
    return { status: 'error', message: error.toString() };
  }
}

// Handle GET requests - Retrieve data (with optional filtering)
function doGet(e) {
  try {
    const sheetName = e.parameter.sheet || 'Users Sheet';
    const sheet = getSheet(sheetName);
    
    if (!sheet) {
      const output = ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Sheet not found'
      }));
      output.setMimeType(ContentService.MimeType.JSON);
      output.setHeader("Access-Control-Allow-Origin", "*");
      output.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      output.setHeader("Access-Control-Allow-Headers", "Content-Type");
      return output;
    }
    
    const data = sheet.getDataRange().getValues();
    
    const output = ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      sheet: sheetName,
      data: data
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    output.setHeader("Access-Control-Allow-Origin", "*");
    output.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    output.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return output;
  } catch(error) {
    const output = ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    output.setHeader("Access-Control-Allow-Origin", "*");
    output.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    output.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return output;
  }
}
