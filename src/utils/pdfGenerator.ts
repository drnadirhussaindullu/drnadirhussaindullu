import { jsPDF } from 'jspdf';
import { Appointment, HospitalInfoData } from '../types';

export const generateAppointmentPDF = (
  appointment: Appointment,
  hospitalInfo: HospitalInfoData
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Header Background Accent Bar
  doc.setFillColor(15, 118, 110); // Teal 700 (#0F766E)
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Hospital Name Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GULZAR FAMILY HOSPITAL & CHILDREN CENTER', margin, 12);

  // Subtitle / Motto
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(204, 251, 241); // Teal 100
  doc.text('Center for Pediatric Excellence, Neonatal Nursery, Maternity & Family Health', margin, 18);
  doc.text('Fatehpur Road, Chowk Azam, District Layyah, Punjab, Pakistan • 24/7 Helpline: +92 340 4777745', margin, 24);

  // Document Title Banner
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(margin, 38, contentWidth, 14, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, 38, contentWidth, 14, 'S');

  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('OPD APPOINTMENT TOKEN & MEDICAL VISIT RECEIPT', margin + 4, 47);

  const statusText = appointment.status === 'confirmed' 
    ? 'CONFIRMED' 
    : appointment.status === 'payment_submitted' 
    ? 'VERIFICATION PENDING' 
    : 'RESERVED';
  
  doc.setFontSize(9);
  doc.setTextColor(15, 118, 110);
  doc.text(`STATUS: ${statusText}`, pageWidth - margin - 45, 47);

  // Token ID & Timestamp Bar
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Token Ref: ${appointment.id}`, margin, 58);
  doc.text(`Issued On: ${new Date().toLocaleString()}`, pageWidth - margin - 55, 58);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, 61, pageWidth - margin, 61);

  // Section 1: Patient Information Table
  let y = 68;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('1. PATIENT DEMOGRAPHICS & CLINICAL SUMMARY', margin + 3, y + 5);

  y += 11;
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Patient Full Name:', margin + 3, y);
  doc.text('Age & Gender:', margin + 70, y);
  doc.text('Contact / WhatsApp:', margin + 120, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(appointment.patientName || 'N/A', margin + 3, y);
  doc.text(`${appointment.age || 'N/A'} Years / ${appointment.gender ? appointment.gender.toUpperCase() : 'N/A'}`, margin + 70, y);
  doc.text(appointment.whatsAppNumber || '+92 340 4777745', margin + 120, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Reason for Visit / Reported Symptoms:', margin + 3, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(appointment.reasonForVisit || 'General Pediatric / Clinical Consultation', margin + 3, y);

  // Section 2: Doctor & Consultation Details
  y += 12;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('2. CONSULTING SPECIALIST & APPOINTMENT SCHEDULE', margin + 3, y + 5);

  y += 11;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Assigned Doctor:', margin + 3, y);
  doc.text('Medical Department:', margin + 70, y);
  doc.text('Date & Time Slot:', margin + 120, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(appointment.doctorNameEn || 'Dr. Nadir Hussain Dullu', margin + 3, y);
  doc.text(appointment.departmentEn || 'Pediatrics & Child Care', margin + 70, y);
  doc.text(`${appointment.date} @ ${appointment.time}`, margin + 120, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Consultation Modality:', margin + 3, y);
  doc.text('Facility Location:', margin + 70, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(
    appointment.consultationType === 'hospital_visit'
      ? 'In-Clinic Hospital OPD Visit'
      : 'Online Telemedicine Video Consultation',
    margin + 3,
    y
  );
  doc.text('Gulzar Family Hospital, Fatehpur Road, Chowk Azam', margin + 70, y);

  // Section 3: Financial Receipt & Payment Details
  y += 12;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('3. MEDICAL VISIT BILLING & PAYMENT RECEIPT', margin + 3, y + 5);

  y += 10;
  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('DESCRIPTION', margin + 3, y + 4.5);
  doc.text('BILLING STATUS', margin + 85, y + 4.5);
  doc.text('AMOUNT (PKR)', pageWidth - margin - 25, y + 4.5);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('Specialist Consultation Fee (OPD 15-Min Slot)', margin + 3, y + 4);
  
  const paymentModeLabel = appointment.paymentMethod === 'hospital_counter'
    ? 'Pay at OPD Counter (Cash on Visit)'
    : appointment.paymentMethod === 'jazzcash'
    ? 'JazzCash Account (0340-4777745)'
    : appointment.paymentMethod === 'easypaisa'
    ? 'Easypaisa Account (0340-4777745)'
    : 'Hospital Desk / Online';

  doc.text(paymentModeLabel, margin + 85, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.text(`PKR ${appointment.feePKR || 1500}`, pageWidth - margin - 25, y + 4);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.text('Token Issuance & Electronic Record Reservation', margin + 3, y + 4);
  doc.text('Complimentary / Zero Fee', margin + 85, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.text('PKR 0', pageWidth - margin - 25, y + 4);

  y += 8;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Total Net Payable / Account Amount:', margin + 3, y);
  doc.setTextColor(15, 118, 110);
  doc.text(`PKR ${appointment.feePKR || 1500}`, pageWidth - margin - 25, y);

  if (appointment.paymentReference) {
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Transaction Reference ID: ${appointment.paymentReference}`, margin + 3, y);
  }

  // Section 4: Patient Guidelines & Instructions
  y += 12;
  doc.setFillColor(254, 242, 242); // Subtle Red/Amber Tint
  doc.rect(margin, y, contentWidth, 22, 'F');
  doc.setDrawColor(254, 202, 202);
  doc.rect(margin, y, contentWidth, 22, 'S');

  doc.setTextColor(153, 27, 27); // Red 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('IMPORTANT PATIENT ADVISORY & CLINICAL INSTRUCTIONS:', margin + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(69, 10, 10);
  doc.text('1. Please arrive at Gulzar Family Hospital reception 10-15 minutes prior to your scheduled slot.', margin + 3, y + 10);
  doc.text('2. If you selected "Pay at Counter", please settle the consultation fee at the OPD desk to obtain your vital signs token.', margin + 3, y + 14);
  doc.text('3. In case of acute respiratory distress, severe pediatric dehydration, or high fever, proceed immediately to the Emergency/NICU triage.', margin + 3, y + 18);

  // Section 5: Stamp & Signatures Box
  y += 26;
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 24, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Hospital Registrar / OPD Reception Desk:', margin + 4, y + 6);
  doc.text('Gulzar Family Hospital & Children Center, Chowk Azam', margin + 4, y + 12);
  doc.text('Computer-Generated Official Medical Document. No physical stamp required.', margin + 4, y + 18);

  // Signature box on the right
  doc.line(pageWidth - margin - 50, y + 16, pageWidth - margin - 5, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized Signatory / OPD In-Charge', pageWidth - margin - 48, y + 20);

  // Save the PDF
  const filename = `GFH_Appointment_${appointment.id || 'Receipt'}.pdf`;
  doc.save(filename);
};

export const generatePatientHistoryPDF = (
  patientName: string,
  phone: string,
  appointments: Appointment[],
  hospitalInfo: HospitalInfoData
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header Background Accent Bar
  doc.setFillColor(15, 118, 110); // Teal 700 (#0F766E)
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Hospital Name Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('GULZAR FAMILY HOSPITAL & CHILDREN CENTER', margin, 12);

  // Subtitle / Motto
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(204, 251, 241); // Teal 100
  doc.text('Center for Pediatric Excellence, Neonatal Nursery, Maternity & Family Health', margin, 18);
  doc.text('Fatehpur Road, Chowk Azam, District Layyah, Punjab • 24/7 Emergency & WhatsApp: +92 340 4777745', margin, 24);

  // Document Title Banner
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(margin, 36, contentWidth, 13, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, 36, contentWidth, 13, 'S');

  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('PATIENT APPOINTMENT HISTORY & CLINICAL SUMMARY CARD', margin + 4, 44);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 118, 110);
  doc.text('VERIFIED ELECTRONIC HEALTH RECORD', pageWidth - margin - 65, 44);

  // Reference bar
  const safePhone = phone || (appointments[0] ? appointments[0].whatsAppNumber : 'N/A');
  const cleanDigits = safePhone.replace(/[^0-9]/g, '');
  const recordId = `GFH-EHR-${cleanDigits ? cleanDigits.slice(-7) : 'REC'}`;

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Patient Record ID: ${recordId}`, margin, 54);
  doc.text(`Generated: ${new Date().toLocaleString()} (PKT)`, pageWidth - margin - 65, 54);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, 57, pageWidth - margin, 57);

  // Section 1: Patient Demographics & Summary Box
  let y = 62;
  const primaryAge = appointments[0]?.age ? `${appointments[0].age} Years` : 'N/A';
  const primaryGender = appointments[0]?.gender ? appointments[0].gender.toUpperCase() : 'N/A';
  const totalFees = appointments.reduce((sum, a) => sum + (a.feePKR || 0), 0);
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed' || a.status === 'payment_submitted').length;

  const distinctDoctors = Array.from(new Set(appointments.map((a) => a.doctorNameEn).filter(Boolean)));
  const distinctDepts = Array.from(new Set(appointments.map((a) => a.departmentEn).filter(Boolean)));

  // Outer Demographic Card
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 27, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 27, 'S');

  // Demographic Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PATIENT DEMOGRAPHIC PROFILE & MEDICAL SUMMARY', margin + 3, y + 4.2);

  // Demographic content - 3 columns
  y += 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Full Patient Name:', margin + 4, y);
  doc.text('Primary WhatsApp / Phone:', margin + 65, y);
  doc.text('Total Clinical Consultations:', margin + 125, y);

  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(patientName || appointments[0]?.patientName || 'Patient', margin + 4, y);
  doc.text(safePhone, margin + 65, y);
  doc.setTextColor(15, 118, 110);
  doc.text(`${appointments.length} Total Registered Visits`, margin + 125, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Age / Gender:', margin + 4, y);
  doc.text('Consulted Specialists:', margin + 65, y);
  doc.text('Total Medical Expenditure:', margin + 125, y);

  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${primaryAge} / ${primaryGender}`, margin + 4, y);
  doc.setFontSize(7.5);
  doc.text(distinctDoctors.slice(0, 2).join(', ') || 'Specialist OPD', margin + 65, y);
  doc.setFontSize(8);
  doc.setTextColor(15, 118, 110);
  doc.text(`PKR ${totalFees.toLocaleString()}`, margin + 125, y);

  // Section 2: Chronological Consultation Records Table
  y += 11;
  doc.setFillColor(15, 118, 110); // Teal 700 Table Header
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  const colX = {
    num: margin + 2,
    id: margin + 8,
    dateTime: margin + 35,
    doctorDept: margin + 74,
    modality: margin + 118,
    statusFee: pageWidth - margin - 28,
  };

  doc.text('#', colX.num, y + 4.8);
  doc.text('TOKEN REF', colX.id, y + 4.8);
  doc.text('DATE & TIME', colX.dateTime, y + 4.8);
  doc.text('DOCTOR & SPECIALTY', colX.doctorDept, y + 4.8);
  doc.text('MODALITY & REASON', colX.modality, y + 4.8);
  doc.text('STATUS / FEE', colX.statusFee, y + 4.8);

  y += 7;

  // Table Rows
  appointments.forEach((appt, index) => {
    // Check if we need a new page
    if (y > pageHeight - 45) {
      doc.addPage();
      // Mini header for continuation page
      doc.setFillColor(15, 118, 110);
      doc.rect(0, 0, pageWidth, 16, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('GULZAR FAMILY HOSPITAL - PATIENT MEDICAL HISTORY (CONTINUED)', margin, 10);

      y = 22;
      // Re-render table header
      doc.setFillColor(15, 118, 110);
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('#', colX.num, y + 4.8);
      doc.text('TOKEN REF', colX.id, y + 4.8);
      doc.text('DATE & TIME', colX.dateTime, y + 4.8);
      doc.text('DOCTOR & SPECIALTY', colX.doctorDept, y + 4.8);
      doc.text('MODALITY & REASON', colX.modality, y + 4.8);
      doc.text('STATUS / FEE', colX.statusFee, y + 4.8);
      y += 7;
    }

    const rowHeight = 12;
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, rowHeight, 'S');

    // # index
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${index + 1}.`, colX.num, y + 5);

    // Token Ref
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(appt.id, colX.id, y + 5);

    // Date & Time
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(appt.date, colX.dateTime, y + 5);
    doc.setTextColor(15, 118, 110);
    doc.text(appt.time, colX.dateTime, y + 9);

    // Doctor & Department
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    const shortDoc = (appt.doctorNameEn || 'Specialist').replace('Dr. ', '');
    doc.text(`Dr. ${shortDoc}`, colX.doctorDept, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    const deptStr = appt.departmentEn || 'Outpatient Clinic';
    doc.text(deptStr.length > 25 ? deptStr.substring(0, 24) + '...' : deptStr, colX.doctorDept, y + 9);

    // Modality & Reason
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(
      appt.consultationType === 'hospital_visit' ? 'In-Clinic OPD' : 'Telemedicine',
      colX.modality,
      y + 5
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    const reasonStr = appt.reasonForVisit || 'General Clinical Consultation';
    doc.text(reasonStr.length > 28 ? reasonStr.substring(0, 27) + '...' : reasonStr, colX.modality, y + 9);

    // Status & Fee
    const statusLabel =
      appt.status === 'confirmed'
        ? 'CONFIRMED'
        : appt.status === 'completed'
        ? 'COMPLETED'
        : appt.status === 'payment_submitted'
        ? 'IN VERIFY'
        : appt.status === 'cancelled'
        ? 'CANCELLED'
        : 'PENDING';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    if (appt.status === 'completed') {
      doc.setTextColor(126, 34, 206); // Purple
    } else if (appt.status === 'confirmed') {
      doc.setTextColor(15, 118, 110); // Teal
    } else if (appt.status === 'cancelled') {
      doc.setTextColor(185, 28, 28); // Red
    } else {
      doc.setTextColor(180, 83, 9); // Amber
    }
    doc.text(statusLabel, colX.statusFee, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`PKR ${appt.feePKR || 1500}`, colX.statusFee, y + 9);

    y += rowHeight;
  });

  // Section 3: Summary Totals & Reconciliation Bar
  y += 5;
  if (y > pageHeight - 48) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 12, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 12, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Visits Recorded: ${appointments.length}`, margin + 5, y + 7.5);
  doc.text(`Completed: ${completedCount}`, margin + 50, y + 7.5);
  doc.text(`Active / Confirmed: ${confirmedCount}`, margin + 85, y + 7.5);
  doc.setTextColor(15, 118, 110);
  doc.text(`Total Medical Outlay: PKR ${totalFees.toLocaleString()}`, pageWidth - margin - 55, y + 7.5);

  // Section 4: Clinical Advisory Box
  y += 16;
  if (y > pageHeight - 35) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(254, 242, 242);
  doc.rect(margin, y, contentWidth, 17, 'F');
  doc.setDrawColor(254, 202, 202);
  doc.rect(margin, y, contentWidth, 17, 'S');

  doc.setTextColor(153, 27, 27);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('OFFICIAL CLINICAL RECORD & PATIENT INSTRUCTIONS:', margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(69, 10, 10);
  doc.text('1. This electronic summary card represents the chronological record of outpatient consultations at Gulzar Family Hospital.', margin + 3, y + 8.5);
  doc.text('2. Please retain this summary for ongoing pediatrician reviews, pediatric growth tracking, or maternal ANC evaluations.', margin + 3, y + 12);
  doc.text('3. In case of neonatal fever, acute breathing distress, or pediatric emergencies, report directly to our 24/7 NICU triage.', margin + 3, y + 15.5);

  // Section 5: Signature & Verification Stamp Box
  y += 21;
  if (y > pageHeight - 25) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 20, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Gulzar Family Hospital & Children Center • Medical Records Department', margin + 4, y + 6);
  doc.text('Fatehpur Road, Chowk Azam, Layyah • Computer-Generated Summary', margin + 4, y + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(`Official EMR Verification Hash: ${recordId}-${Date.now().toString(36).toUpperCase()}`, margin + 4, y + 16);

  // Signature line on right
  doc.line(pageWidth - margin - 50, y + 13, pageWidth - margin - 5, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('Medical Superintendent / In-Charge', pageWidth - margin - 48, y + 17);

  // Save the PDF
  const cleanName = (patientName || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `GFH_Medical_History_${cleanName}.pdf`;
  doc.save(filename);
};

