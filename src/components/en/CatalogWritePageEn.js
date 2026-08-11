'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../app/styles/globals.css';
import SupportSubNavEn from './SupportSubNavEn';

export default function CatalogWritePageEn() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    title: '',
    content: '',
    isSecret: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.password || !formData.title || !formData.content) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const boardRes = await fetch('/api/en/boards?slug=catalog');
      const boardData = await boardRes.json();

      if (!boardData.board) {
        throw new Error('Board not found.');
      }

      const boardId = boardData.board.id;

      const res = await fetch('/api/en/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId,
          title: formData.title,
          content: formData.content,
          author: formData.name,
          password: formData.password,
          isSecret: formData.isSecret,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit.');
      }

      alert('Your catalog request has been submitted.');
      router.push('/en/support/catalog');
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/en">Home</a>
          <span>&gt;</span>
          <a href="/en/support">Support</a>
          <span>&gt;</span>
          <a href="/en/support/catalog">Catalog Request</a>
          <span>&gt;</span>
          <span>New Request</span>
        </div>
      </div>

      <section className="page-header">
        <div className="page-header-content">
          <h1>Catalog Request</h1>
          <p>Fill out the form to request a product catalog.</p>
        </div>
      </section>

      <SupportSubNavEn section="support" active="/support/catalog" />

      <div className="form-container">
        <div className="form-intro">
          <p>Please fill out the form below to request a product catalog. We will send it to you as soon as possible.</p>
        </div>

        <form onSubmit={handleSubmit} className="catalog-form">
          <table className="form-table">
            <tbody>
              <tr>
                <th>Name <span className="required">*</span></th>
                <td>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Enter your name"
                  />
                </td>
                <th>Password <span className="required">*</span></th>
                <td>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Needed to edit/delete"
                  />
                </td>
              </tr>
              <tr>
                <th>Subject <span className="required">*</span></th>
                <td colSpan="3">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="form-input-full"
                    placeholder="Enter the subject of your request"
                  />
                </td>
              </tr>
              <tr>
                <th>Message <span className="required">*</span></th>
                <td colSpan="3">
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows="10"
                    className="form-textarea"
                    placeholder="Please include your shipping address (country, city, street, postal code) and contact details"
                  ></textarea>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="form-buttons">
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" onClick={() => router.push('/en/support/catalog')} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
