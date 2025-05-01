# GTU CGPA Calculator

A responsive web application for calculating CGPA, CPI, and percentage for Gujarat Technical University students.

## Features

- **Core Functionality**
  - Input form for up to 12 subjects with grade points and credit hours
  - Real-time validation for numeric inputs and credit hour constraints
  - Calculation engine implementing:
    - Percentage = (CPI/CGPA − 0.5) × 10
    - Optional support for CGPA × 9.5 conversion
  - Immediate display of results

- **User Interface & Experience**
  - Clean, minimal design with intuitive labels
  - Tooltips explaining SPI, CPI, CGPA
  - Fully responsive layout
  - Light/dark theme toggle

- **Advanced Features**
  - Export calculation results as PDF or CSV (simulated)
  - Calculation history saved in browser local storage
  - Semester-wise performance charts using Chart.js
  - Theme toggle with persistent preference

## Project Structure

```
c2/
├── index.html       # Main HTML structure
├── styles.css       # CSS styling with responsive design
├── script.js        # JavaScript functionality
└── README.md        # Documentation
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Libraries**: 
  - Chart.js for data visualization
  - Font Awesome for icons
- **Storage**: Browser Local Storage for saving calculation history
- **Export**: Simulated PDF/CSV export functionality

## How to Run Locally

1. Clone or download this repository
2. Navigate to the project directory
3. Open `index.html` in your web browser

No build process or server is required as this is a client-side only application.

## Usage Instructions

### Semester Calculation

1. Enter grade points (0-10) and credit hours (1-7) for each subject
2. Use the "Add Subject" button to add more subjects (up to 12)
3. Enter the semester number
4. If this is not your first semester, enter your previous CPI and total credits
5. Click "Calculate" to see your results
6. Optionally save the result to history or export it

### Direct CGPA Conversion

1. Switch to the "Direct CGPA Conversion" tab
2. Enter your CGPA
3. Select the conversion formula
4. Click "Calculate" to see your percentage
5. Optionally save the result to history or export it

## Calculation Formulas

- **SPI (Semester Performance Index)**:
  ```
  SPI = Sum(Grade Points × Credit Hours) / Sum(Credit Hours)
  ```

- **CPI (Cumulative Performance Index)**:
  ```
  CPI = (Previous CPI × Previous Credits + Current SPI × Current Credits) / (Previous Credits + Current Credits)
  ```

- **Percentage Conversion**:
  ```
  Percentage = (CPI/CGPA - 0.5) × 10
  ```
  or
  ```
  Percentage = CPI/CGPA × 9.5
  ```

## Future Enhancements

- Backend integration for user accounts and data persistence
- Grade to grade point conversion tool
- CGPA predictor tool
- Actual PDF/CSV export implementation
- Mobile app version

## License

This project is open source and available for educational purposes.
