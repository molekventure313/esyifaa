# Panggil MCP esyifa terus (JSON-RPC melalui curl) bila alat mcp__esyifa__* tiada dalam sesi. Key dibaca dari ~/.claude.json, tidak dicetak.
# python scripts/autopilot/mcp_call.py <tool> '<json args>'   |   python scripts/autopilot/mcp_call.py list <tool...>
import json, os, subprocess, sys, tempfile
def call(method, params):
    s=json.load(open(os.path.expanduser('~/.claude.json'),encoding='utf-8'))['projects']['C:/Users/ACER/Desktop/Esyifaa']['mcpServers']['esyifa']
    fd,h=tempfile.mkstemp(); os.write(fd,('Authorization: '+s['headers']['Authorization']+'\n').encode()); os.close(fd)
    try:
        body=json.dumps({"jsonrpc":"2.0","id":1,"method":method,"params":params})
        out=subprocess.run(['curl','-sS','-m','120','-H','@'+h,'-H','Content-Type: application/json','-H','Accept: application/json, text/event-stream','--data-binary','@-',s['url']],input=body.encode(),capture_output=True).stdout.decode('utf-8')
    finally: os.remove(h)
    if out.startswith('event:') or 'data:' in out[:20]:
        out=[l[5:] for l in out.splitlines() if l.startswith('data:')][-1]
    return json.loads(out)
def tool(name,args):
    r=call('tools/call',{'name':name,'arguments':args})
    if 'error' in r: raise SystemExit(json.dumps(r['error']))
    txt=''.join(c.get('text','') for c in r['result'].get('content',[]))
    try: return json.loads(txt), r['result'].get('isError')
    except: return txt, r['result'].get('isError')
if __name__=='__main__':
    if sys.argv[1]=='list':
        for t in call('tools/list',{})['result']['tools']:
            if t['name'] in sys.argv[2:]: print(json.dumps(t,ensure_ascii=False))
    else:
        print(json.dumps(tool(sys.argv[1], json.loads(sys.argv[2]) if len(sys.argv)>2 else {}),ensure_ascii=False))
