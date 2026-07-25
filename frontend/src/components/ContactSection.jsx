import React, { useState } from 'react';

const FAQS = [
  {
    q: 'How do I place bulk orders for campus events?',
    a: 'For bulk canteen orders (e.g. club seminars, department meets, workshops), select "Bulk Canteen Order" in the subject selector, enter details, or contact our manager directly via phone.'
  },
  {
    q: 'Where does Room Delivery deliver to?',
    a: 'We deliver to all major campus hostels (Boys Hostel and Girls Hostel). Be sure to double-check your Block and Room Number at checkout to avoid delivery delays.'
  },
  {
    q: 'My print document did not upload correctly, what should I do?',
    a: 'If the Xerox file loader has issues reading your file size, don\'t worry! The calculator will still allow you to order by typing the page count manually and proceeding. Feel free to alert the operator via a message here under "Xerox Print Issue".'
  },
  {
    q: 'Can I cancel an active order?',
    a: 'You can cancel any food or print order from your "My Orders" tab, but only while the status is "Pending". Once the kitchen accepts it and changes the status to "Preparing", cancellation is no longer possible.'
  }
];

export default function ContactSection({ formSuccess, onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [msg, setMsg] = useState('');
  
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (idx) => {
    setActiveFaq(prev => (prev === idx ? null : idx));
  };

  const validateField = (field, value) => {
    let err = '';
    if (field === 'name') {
      if (!value.trim()) err = 'Name is required.';
      else if (value.trim().length < 2) err = 'Name must be at least 2 characters.';
    }
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) err = 'Email address is required.';
      else if (!emailRegex.test(value)) err = 'Please enter a valid email address.';
    }
    if (field === 'msg') {
      if (!value.trim()) err = 'Message is required.';
      else if (value.trim().length < 10) err = 'Message must be at least 10 characters.';
    }
    
    setErrors(prev => ({ ...prev, [field]: err }));
    return err === '';
  };

  const handleBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleChange = (field, value) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'msg') setMsg(value);
    
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isNameValid = validateField('name', name);
    const isEmailValid = validateField('email', email);
    const isMsgValid = validateField('msg', msg);

    setTouched({ name: true, email: true, msg: true });

    if (isNameValid && isEmailValid && isMsgValid) {
      onSubmit({ 
        name: name.trim(), 
        email: email.trim(), 
        subject,
        msg: msg.trim() 
      });
      setName('');
      setEmail('');
      setSubject('general');
      setMsg('');
      setErrors({});
      setTouched({});
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-tag">Get in Touch</span>
          <h2 className="section-title">Contact Us</h2>
          <p className="section-sub">Have feedback, suggestions or bulk orders? We'd love to hear from you!</p>
        </div>

        <div className="contact-grid">
          
          <div className="contact-info reveal">
            <div className="contact-card">
              <div className="contact-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <strong>Location</strong>
                <p>Ground Floor, Administrative Building, SPNREC, Araria</p>
              </div>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.43 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.34 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.4a16 16 0 006.29 6.29l.77-.77a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              </div>
              <div>
                <strong>Phone / Call Canteen</strong>
                <p>
                  <a href="tel:+919631899999" className="contact-link">+91 1234567890</a> &nbsp;|&nbsp; <a href="tel:+919800000000" className="contact-link">+91 98000 00000</a>
                </p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <strong>Hours</strong>
                <p>Mon–Sun: 7:00 AM – 10:00 PM</p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <strong>Email</strong>
                <p>canteen@spnrec.edu.in</p>
              </div>
            </div>
          </div>

          
          <form className="contact-form reveal" id="contactForm" noValidate onSubmit={handleSubmit}>
            <div className={`form-group ${touched.name && errors.name ? 'has-error' : ''}`}>
              <label htmlFor="contactName">Your Name</label>
              <input
                type="text"
                id="contactName"
                placeholder="Enter your name"
                required
                value={name}
                onChange={e => handleChange('name', e.target.value)}
                onBlur={e => handleBlur('name', e.target.value)}
              />
              {touched.name && errors.name && (
                <span className="validation-error-text">{errors.name}</span>
              )}
            </div>

            <div className={`form-group ${touched.email && errors.email ? 'has-error' : ''}`}>
              <label htmlFor="contactEmail">Email Address</label>
              <input
                type="email"
                id="contactEmail"
                placeholder="Enter your email"
                required
                value={email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={e => handleBlur('email', e.target.value)}
              />
              {touched.email && errors.email && (
                <span className="validation-error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="contactSubject">Category</label>
              <select
                id="contactSubject"
                className="x-select"
                style={{ width: '100%' }}
                value={subject}
                onChange={e => setSubject(e.target.value)}
              >
                <option value="general">General Canteen Inquiry</option>
                <option value="bulk">Bulk Canteen Order Request</option>
                <option value="lost">Lost &amp; Found Inquiry</option>
                <option value="xerox">Xerox Print Issue</option>
              </select>
            </div>

            <div className={`form-group ${touched.msg && errors.msg ? 'has-error' : ''}`}>
              <label htmlFor="contactMsg">Message</label>
              <textarea
                id="contactMsg"
                rows="4"
                placeholder="Tell us how we can help you..."
                required
                value={msg}
                onChange={e => handleChange('msg', e.target.value)}
                onBlur={e => handleBlur('msg', e.target.value)}
              ></textarea>
              {touched.msg && errors.msg && (
                <span className="validation-error-text">{errors.msg}</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary full-width" id="contactSubmitBtn">Send Message</button>
            
            <div className={`form-success ${formSuccess ? '' : 'hidden'}`} id="formSuccess">
              Message sent successfully! We'll get back to you soon.
            </div>
          </form>
        </div>

        
        <div className="faq-container reveal">
          <h3 className="faq-title">Frequently Asked Questions</h3>
          
          <div className="faq-accordion">
            {FAQS.map((faq, idx) => {
              const isActive = activeFaq === idx;
              return (
                <div className={`faq-item ${isActive ? 'active' : ''}`} key={idx}>
                  <button 
                    type="button" 
                    className="faq-question"
                    onClick={() => toggleFaq(idx)}
                  >
                    <span>{faq.q}</span>
                    <span className="faq-chevron">{isActive ? '▲' : '▼'}</span>
                  </button>
                  <div className="faq-answer">
                    <div className="faq-answer-inner">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
