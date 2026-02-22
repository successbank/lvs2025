'use client';

import { useState, useEffect } from 'react';
import '../app/styles/globals.css';

export default function CatalogPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone1: '010',
    phone2: '',
    phone3: '',
    company: '',
    companyPhone1: '02',
    companyPhone2: '',
    companyPhone3: '',
    zipcode: '',
    address: '',
    addressDetail: '',
    email1: '',
    email2: '',
    emailDomain: '직접입력',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 다음 우편번호 API 스크립트 로드
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 이메일 도메인 선택 시 자동 입력
    if (name === 'emailDomain' && value !== '직접입력') {
      setFormData(prev => ({
        ...prev,
        email2: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone2 || !formData.phone3) {
      alert('이름과 휴대폰 번호를 입력해주세요.');
      return;
    }

    if (!formData.zipcode || !formData.address) {
      alert('주소를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const phone = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;
      const email = formData.email1 && formData.email2
        ? `${formData.email1}@${formData.email2}`
        : '';
      const fullAddress = formData.addressDetail
        ? `(${formData.zipcode}) ${formData.address} ${formData.addressDetail}`
        : `(${formData.zipcode}) ${formData.address}`;

      const response = await fetch('/api/catalog-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone,
          email,
          company: formData.company || null,
          address: fullAddress,
          message: formData.message || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || '신청에 실패했습니다.');
      }

      alert('카탈로그 신청이 완료되었습니다.\n빠른 시일 내에 발송해 드리겠습니다.');

      setFormData({
        name: '',
        phone1: '010',
        phone2: '',
        phone3: '',
        company: '',
        companyPhone1: '02',
        companyPhone2: '',
        companyPhone3: '',
        zipcode: '',
        address: '',
        addressDetail: '',
        email1: '',
        email2: '',
        emailDomain: '직접입력',
        message: '',
      });
    } catch (error) {
      alert(error.message || '카탈로그 신청에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const findPostcode = () => {
    if (typeof window === 'undefined' || !window.daum?.Postcode) {
      alert('우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        setFormData(prev => ({
          ...prev,
          zipcode: data.zonecode,
          address: addr,
        }));
      },
    }).open();
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/support">고객지원</a>
          <span>&gt;</span>
          <span>카탈로그 신청</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="page-header">
        <div className="page-header-content">
          <h1>카탈로그 신청</h1>
          <p>엘브이에스는 모두에게 감동을 전할 수 있는 빛의 기술을 연구합니다.</p>
        </div>
      </section>

      {/* Sub Navigation */}
      <div className="sub-nav">
        <div className="sub-nav-container">
          <a href="/support/tech-guide">테크니컬 가이드</a>
          <a href="/support/downloads">자료 다운로드</a>
          <a href="/support/consultation">온라인 상담실</a>
          <a href="/support/notices">공지사항</a>
          <a href="/support/contact">찾아오시는 길</a>
          <a href="/support/catalog" className="active">카탈로그 신청</a>
        </div>
      </div>

      {/* Catalog Form */}
      <div className="form-container">
        <div className="form-intro">
          <p>제품 카탈로그를 우편으로 발송해 드립니다. 아래 정보를 입력해 주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="catalog-form">
          <table className="form-table">
            <tbody>
              <tr>
                <th>신청인 <span className="required">*</span></th>
                <td>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </td>
                <th>휴대폰 <span className="required">*</span></th>
                <td className="phone-input">
                  <select name="phone1" value={formData.phone1} onChange={handleInputChange} className="form-select">
                    <option value="010">010</option>
                    <option value="011">011</option>
                    <option value="016">016</option>
                    <option value="017">017</option>
                    <option value="018">018</option>
                    <option value="019">019</option>
                  </select>
                  <span>-</span>
                  <input
                    type="text"
                    name="phone2"
                    value={formData.phone2}
                    onChange={handleInputChange}
                    maxLength="4"
                    required
                    className="form-input-small"
                  />
                  <span>-</span>
                  <input
                    type="text"
                    name="phone3"
                    value={formData.phone3}
                    onChange={handleInputChange}
                    maxLength="4"
                    required
                    className="form-input-small"
                  />
                </td>
              </tr>
              <tr>
                <th>회사명</th>
                <td>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </td>
                <th>회사 전화번호</th>
                <td className="phone-input">
                  <select name="companyPhone1" value={formData.companyPhone1} onChange={handleInputChange} className="form-select">
                    <option value="02">02</option>
                    <option value="031">031</option>
                    <option value="032">032</option>
                    <option value="033">033</option>
                    <option value="041">041</option>
                    <option value="042">042</option>
                    <option value="043">043</option>
                    <option value="051">051</option>
                    <option value="052">052</option>
                    <option value="053">053</option>
                    <option value="054">054</option>
                    <option value="055">055</option>
                    <option value="061">061</option>
                    <option value="062">062</option>
                    <option value="063">063</option>
                    <option value="064">064</option>
                    <option value="070">070</option>
                  </select>
                  <span>-</span>
                  <input
                    type="text"
                    name="companyPhone2"
                    value={formData.companyPhone2}
                    onChange={handleInputChange}
                    maxLength="4"
                    className="form-input-small"
                  />
                  <span>-</span>
                  <input
                    type="text"
                    name="companyPhone3"
                    value={formData.companyPhone3}
                    onChange={handleInputChange}
                    maxLength="4"
                    className="form-input-small"
                  />
                </td>
              </tr>
              <tr>
                <th>수령 주소 <span className="required">*</span></th>
                <td colSpan="3">
                  <div className="address-input">
                    <input
                      type="text"
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleInputChange}
                      placeholder="우편번호"
                      required
                      readOnly
                      className="form-input-small"
                    />
                    <button type="button" onClick={findPostcode} className="btn-find-postcode">
                      우편번호 찾기
                    </button>
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="주소"
                    required
                    readOnly
                    className="form-input-full"
                  />
                  <input
                    type="text"
                    name="addressDetail"
                    value={formData.addressDetail}
                    onChange={handleInputChange}
                    placeholder="나머지 상세주소를 입력해주세요."
                    className="form-input-full"
                  />
                </td>
              </tr>
              <tr>
                <th>이메일</th>
                <td colSpan="3" className="email-input">
                  <input
                    type="text"
                    name="email1"
                    value={formData.email1}
                    onChange={handleInputChange}
                    className="form-input-medium"
                  />
                  <span>@</span>
                  <input
                    type="text"
                    name="email2"
                    value={formData.email2}
                    onChange={handleInputChange}
                    disabled={formData.emailDomain !== '직접입력'}
                    className="form-input-medium"
                  />
                  <select name="emailDomain" value={formData.emailDomain} onChange={handleInputChange} className="form-select">
                    <option value="직접입력">직접입력</option>
                    <option value="naver.com">naver.com</option>
                    <option value="daum.net">daum.net</option>
                    <option value="gmail.com">gmail.com</option>
                    <option value="hotmail.com">hotmail.com</option>
                    <option value="nate.com">nate.com</option>
                  </select>
                </td>
              </tr>
              <tr>
                <th>전하실 말씀</th>
                <td colSpan="3">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="전하실 말씀을 입력해 주세요."
                    className="form-textarea"
                  ></textarea>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="form-buttons">
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? '신청 중...' : '확인'}
            </button>
            <button type="button" onClick={() => window.history.back()} className="btn-cancel">
              취소
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
