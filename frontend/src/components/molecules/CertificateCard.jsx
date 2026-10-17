import React from 'react';

export const CertificateCard = ({
  authority = 'Sri Sankara TV',
  title = 'Authentication Certificate',
  subtitle = 'Soora Samhara Pooja 2026',
  sealText = 'வேல்',
  caption = 'Illustration of the certificate. Final design may differ.'
}) => {
  return (
    <div>
      <div className="cert" role="img" aria-label="Illustration of the authentication certificate">
        <div className="cert-in">
          <p className="cert-k">{authority}</p>
          <p className="cert-t">{title}</p>
          <p className="cert-s">{subtitle}</p>
          <div className="cert-rule"></div>
          <div className="cert-seal" lang="ta">{sealText}</div>
        </div>
      </div>
      {caption && <p className="cert-cap">{caption}</p>}
    </div>
  );
};

export default CertificateCard;
