# Chubspresso - Espresso Tracker Frontend

A beautiful, modern web application for tracking your espresso brewing journey. Built with vanilla HTML, CSS, and JavaScript, this frontend connects to the espresso API to provide a complete espresso tracking experience.

## Features

### 📊 **Entries Management**
- View all your espresso entries in a beautiful card layout
- Filter entries by bean name, rating, and roast level
- Pagination for easy navigation through large datasets
- Real-time search and filtering

### ➕ **Add New Entries**
- Comprehensive form for adding new espresso entries
- All required fields with proper validation
- Optional fields for flavors and notes
- Automatic form reset after successful submission

### ✏️ **Edit & Delete**
- Edit existing entries through a modal interface
- Delete entries with confirmation
- Real-time updates after modifications

### 📈 **Statistics Dashboard**
- Overview of your espresso journey
- Total entries count
- Average ratings, extraction times, and doses
- Top beans by usage and average rating
- Top origins by frequency

## Design Features

- **Modern UI**: Clean, coffee-themed design with warm colors
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Hover effects and transitions for better UX
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Success Notifications**: Toast notifications for successful actions

## Getting Started

### Prerequisites

1. Make sure the espresso API server is running on `http://localhost:3000`
2. Ensure the API has CORS enabled (already configured in the server)

### Running the Frontend

1. **Simple Method**: Open `index.html` directly in your browser
   - Double-click the `index.html` file
   - Or drag it into your browser window

2. **Local Server Method** (Recommended):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
   
   Then open `http://localhost:8000` in your browser

### API Configuration

The frontend is configured to connect to the espresso API at `http://localhost:3000/api/espresso`. If your API is running on a different port or URL, update the `API_BASE_URL` constant in `script.js`:

```javascript
const API_BASE_URL = 'http://your-api-url:port/api/espresso';
```

## Usage Guide

### Adding a New Espresso Entry

1. Click the "Add Entry" tab
2. Fill in the required fields:
   - **Bean Name**: The name of your coffee beans
   - **Grind Size**: Your grinder setting (1-50)
   - **Dose**: Coffee grounds weight in grams
   - **Yield**: Final espresso weight in grams
   - **Extraction Time**: Brew time in seconds
   - **Rating**: Your rating from 1-10
3. Optionally fill in:
   - **Origin**: Coffee origin (e.g., "Ethiopia", "Colombia")
   - **Roast Level**: Light, Medium-Light, Medium, Medium-Dark, or Dark
   - **Flavors**: Taste notes (e.g., "chocolate, caramel, citrus")
   - **Notes**: Additional observations
4. Click "Save Entry"

### Viewing and Filtering Entries

1. The "Entries" tab shows all your espresso entries
2. Use the filters at the top:
   - **Bean Name**: Search by partial bean name
   - **Rating**: Filter by specific rating
   - **Roast Level**: Filter by roast level
3. Use pagination controls to navigate through pages
4. Click "Clear Filters" to reset all filters

### Editing an Entry

1. Find the entry you want to edit in the entries list
2. Click the "Edit" button
3. Modify the values in the modal form
4. Click "Update Entry" to save changes

### Deleting an Entry

1. Find the entry you want to delete
2. Click the "Delete" button
3. Confirm the deletion in the popup dialog

### Viewing Statistics

1. Click the "Statistics" tab
2. View your overall espresso statistics:
   - Total number of entries
   - Average rating across all entries
   - Average extraction time
   - Average dose
3. See your most-used beans and their average ratings
4. View your most common coffee origins

## File Structure

```
Chubspresso/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality and API integration
└── README.md           # This file
```

## API Endpoints Used

The frontend uses the following API endpoints:

- `GET /api/espresso` - List all entries with filtering and pagination
- `POST /api/espresso` - Create a new entry
- `PUT /api/espresso/:id` - Update an existing entry
- `DELETE /api/espresso/:id` - Delete an entry
- `GET /api/espresso/stats/summary` - Get statistics

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **"Failed to load entries" error**
   - Make sure the API server is running
   - Check that the API URL in `script.js` is correct
   - Verify CORS is enabled on the server

2. **Form validation errors**
   - Ensure all required fields are filled
   - Check that numeric fields contain valid numbers
   - Verify rating is between 1-10

3. **Modal not opening**
   - Check browser console for JavaScript errors
   - Ensure all required DOM elements exist

### Debug Mode

Open the browser's Developer Tools (F12) and check the Console tab for any error messages or API response details.

## Contributing

Feel free to enhance this frontend by:
- Adding new features
- Improving the design
- Adding more filtering options
- Implementing data export functionality
- Adding charts and graphs to the statistics

## License

This project is open source and available under the MIT License. 