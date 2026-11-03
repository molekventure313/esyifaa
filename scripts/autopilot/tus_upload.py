# Upload berpecah (TUS, 400KB/bahagian, cuba semula) ke URL bertandatangan Supabase dari request_upload.
# Guna bila PUT terus gagal (sambungan di PC ini diputuskan untuk upload > ±2MB).
import base64, os, re, subprocess, sys, tempfile
from urllib.parse import urlparse, parse_qs
ENV=dict(re.findall(r'^([A-Z_]+)=(.*)$', open(r'C:/Users/ACER/Desktop/Esyifaa/.env.local',encoding='utf-8').read(), re.M))
def curl(args, data=None):
    p=subprocess.run(['curl','-sS','--http1.1','-m','120','-D','-','-o','-']+args, input=data, capture_output=True)
    return p.stdout.decode('latin1'), p.stderr.decode('latin1')
def tus_upload(upload_url, path, ct, chunk=400_000):
    u=urlparse(upload_url); token=parse_qs(u.query)['token'][0]
    m=re.search(r'/object/upload/sign/([^/]+)/(.+)$', u.path); bucket,obj=m.group(1),m.group(2)
    base=ENV['NEXT_PUBLIC_SUPABASE_URL'].strip().strip('"').rstrip('/'); anon=ENV['NEXT_PUBLIC_SUPABASE_ANON_KEY'].strip().strip('"')
    size=os.path.getsize(path); b=lambda s: base64.b64encode(s.encode()).decode()
    meta=f"bucketName {b(bucket)},objectName {b(obj)},contentType {b(ct)}"
    hd=['-H','Tus-Resumable: 1.0.0','-H',f'apikey: {anon}','-H',f'x-signature: {token}']
    out,err=curl(['-X','POST']+hd+['-H',f'Upload-Length: {size}','-H',f'Upload-Metadata: {meta}',base+'/storage/v1/upload/resumable/sign'])
    loc=re.search(r'^location:\s*(\S+)', out, re.I|re.M)
    if not loc: raise SystemExit('TUS create failed: '+out[:300]+err[:200])
    loc=loc.group(1)
    if loc.startswith('/'): loc=base+loc
    off=0; data=open(path,'rb').read()
    while off<size:
        part=data[off:off+chunk]
        for attempt in range(6):
            out,err=curl(['-X','PATCH']+hd+['-H',f'Upload-Offset: {off}','-H','Content-Type: application/offset+octet-stream','--data-binary','@-',loc], data=part)
            st=re.match(r'HTTP/\S+ (\d+)', out)
            if st and st.group(1)=='204': break
            print('retry',off,attempt,err.strip()[:80],flush=True)
            h,_=curl(['-I','-X','HEAD']+hd+[loc]); mo=re.search(r'^upload-offset:\s*(\d+)', h, re.I|re.M)
            if mo and int(mo.group(1))!=off: off=int(mo.group(1)); part=data[off:off+chunk]
        else: raise SystemExit(f'PATCH fail at {off}: '+out[:300]+err[:200])
        off=int(re.search(r'^upload-offset:\s*(\d+)', out, re.I|re.M).group(1))
    return True
if __name__=='__main__':
    # python scripts/autopilot/tus_upload.py <fail> <upload_url dari request_upload> [content-type]
    print(tus_upload(sys.argv[2], sys.argv[1], sys.argv[3] if len(sys.argv)>3 else 'video/mp4'))
