import React, { useState } from 'react';

const HelpForm = () => {
  const [activeField, setActiveField] = useState<string>('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    inquiry: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://formsubmit.co/e21af56276f202ce8918c6c09852f23d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          _subject: `New Help Request from ${formData.fullName}`,
          _template: 'box'
        })
      });
      
      if (response.ok) {
        alert('Message sent successfully! Our team will get back to you shortly.');
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          inquiry: ''
        });
      } else {
        alert('Failed to send message. Please check your form and try again.');
      }
    } catch (error) {
      alert('Failed to send message. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const inputStyles = `w-full p-4 rounded-full outline-none transition-all duration-200
    placeholder:text-gray-400 bg-white
    border border-gray-200
    focus:border-black`;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-white rounded-[32px] shadow-sm border border-gray-200 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            required
            className={inputStyles}
            onFocus={() => setActiveField('fullName')}
            onBlur={() => setActiveField('')}
            value={formData.fullName}
            onChange={handleChange}
          />
          
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (optional)"
            className={inputStyles}
            onFocus={() => setActiveField('phone')}
            onBlur={() => setActiveField('')}
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          required
          className={inputStyles}
          onFocus={() => setActiveField('email')}
          onBlur={() => setActiveField('')}
          value={formData.email}
          onChange={handleChange}
        />

        <textarea
          name="inquiry"
          placeholder="Please provide a short inquiry for us to understand your needs"
          required
          rows={6}
          className={`w-full p-4 rounded-[24px] outline-none transition-all duration-200
            placeholder:text-gray-400 bg-white
            border border-gray-200
            focus:border-black
            resize-none`}
          onFocus={() => setActiveField('inquiry')}
          onBlur={() => setActiveField('')}
          value={formData.inquiry}
          onChange={handleChange}
        />

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            className="bg-black text-white px-12 py-3 rounded-full hover:bg-gray-200 hover:text-black transition-all shadow-sm hover:shadow-md"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default HelpForm;
