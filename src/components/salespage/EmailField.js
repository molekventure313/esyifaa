'use client';

// Email pelanggan (pilihan) untuk resit bayaran FPX (CHIP). Kosong → server guna email ganti.
// CHIP kunci email di halaman bayaran, jadi pelanggan perlu isi di sini.
export default function EmailField({ value, onChange, name = 'email', inputStyle, labelStyle, hintColor = '#64748B', wrapStyle }) {
  return (
    <div style={wrapStyle || { marginBottom: '1.1rem' }}>
      <label style={labelStyle}>Email (pilihan)</label>
      <input
        type="email"
        name={name}
        inputMode="email"
        autoComplete="email"
        placeholder="Biarkan kosong jika tiada email"
        value={value || ''}
        onChange={onChange}
        maxLength={100}
        style={inputStyle}
      />
      <p style={{ margin: '0.3rem 0 0', fontSize: '0.76rem', color: hintColor }}>
        Resit bayaran FPX dihantar ke email ini.
      </p>
    </div>
  );
}
