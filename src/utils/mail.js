// Build the admin notification email for a new enquiry.
export function enquiryNotificationMail(enquiry) {
  const name = enquiry.name || 'Anonymous'
  const email = enquiry.email || 'Not provided'
  const phone = enquiry.phone || enquiry.whatsapp || 'Not provided'
  const occasion = enquiry.occasion || 'Not specified'
  const eventDate = enquiry.eventDate || 'Not specified'
  const message = (enquiry.message || enquiry.description || enquiry.designDirection || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')

  return {
    to: 'hello@purplebeecakes.com',
    from: 'hello@purplebeecakes.com',
    message: {
      subject: `New cake enquiry from ${name}`,
      html: `
        <h2>New enquiry on purplebeecakes.com</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone/WhatsApp:</strong> ${phone}</p>
        <p><strong>Occasion:</strong> ${occasion}</p>
        <p><strong>Event date:</strong> ${eventDate}</p>
        <p><strong>Source:</strong> ${enquiry.source || 'enquiry'}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${message || 'No message provided.'}</p>
        <hr>
        <p>View it in the admin: <a href="https://purplebeecakes.com/admin/enquiries">/admin/enquiries</a></p>
      `,
    },
  }
}
