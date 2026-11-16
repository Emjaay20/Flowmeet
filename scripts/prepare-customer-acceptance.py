#!/usr/bin/env python3
"""Run on deployment host: prepare a dedicated test workspace and provider webhook.
No customer email or calendar invitation is sent by this script.
"""
import json
from pathlib import Path
import secrets
import urllib.request
import uuid
import subprocess
from urllib.parse import urlencode
root=Path(__file__).resolve().parents[1]
env=root/'.env'
settings={}
for line in env.read_text().splitlines():
    if '=' in line and not line.lstrip().startswith('#'):
        k,v=line.split('=',1);settings[k.strip()]=v.strip().strip('\"\'')

def call(url,body=None,headers=None):
    req=urllib.request.Request(url,data=json.dumps(body).encode() if body is not None else None,headers={'Content-Type':'application/json',**(headers or {})})
    with urllib.request.urlopen(req,timeout=30) as response:return json.load(response)

headers={'apikey':settings['SUPABASE_SERVICE_KEY'],'Authorization':'Bearer '+settings['SUPABASE_SERVICE_KEY'],'Prefer':'return=representation'}
if not settings.get('FLOWMEET_ACCEPTANCE_WORKSPACE_ID'):
    matches=call(settings['NEXT_PUBLIC_SUPABASE_URL']+'/rest/v1/workspaces?'+urlencode({'name':'eq.FlowMeet controlled acceptance tests','owner_email':'eq.yusuf@yusufsaka.dev','select':'id'}),headers=headers)
    if matches:
        workspace=matches[0]['id']
        keys=call(settings['NEXT_PUBLIC_SUPABASE_URL']+'/rest/v1/api_keys?'+urlencode({'workspace_id':'eq.'+workspace,'select':'key'}),headers=headers)
        api_key=keys[0]['key']
    else:
        workspace=str(uuid.uuid4())
        call(settings['NEXT_PUBLIC_SUPABASE_URL']+'/rest/v1/workspaces',[{'id':workspace,'name':'FlowMeet controlled acceptance tests','owner_email':'yusuf@yusufsaka.dev','booking_url':'https://cal.com/yusuf-abubakar-cvy8ug/technical-discovery'}],headers)
        api_key='cp_test_'+secrets.token_hex(24)
        call(settings['NEXT_PUBLIC_SUPABASE_URL']+'/rest/v1/api_keys',[{'workspace_id':workspace,'key':api_key}],headers)
    settings.update(FLOWMEET_ACCEPTANCE_WORKSPACE_ID=workspace,FLOWMEET_CAPTURE_WORKSPACE_ID=workspace,FLOWMEET_PILOT_WORKSPACE_ID=workspace,FLOWMEET_ACCEPTANCE_API_KEY=api_key,FLOWMEET_N8N_CAPTURE_TOKEN=secrets.token_hex(32),CALCOM_EVENT_TYPE_ID='7779843',FLOWMEET_BOOKING_URL='https://cal.com/yusuf-abubakar-cvy8ug/technical-discovery')
    env.write_text('\n'.join(f'{k}={v}' for k,v in settings.items())+'\n');env.chmod(0o600)
    print('Created dedicated acceptance workspace and scoped test key')
if not settings.get('FLOWMEET_RESEND_WEBHOOK_ID'):
    script = """(async()=>{
      const response=await fetch('https://api.resend.com/webhooks',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+process.env.RESEND_API_KEY},body:JSON.stringify({endpoint:'https://flowmeet.aetherhost.com.ng/api/webhooks/resend',events:['email.sent','email.delivered','email.bounced','email.delivery_delayed','email.complained']})});
      const data=await response.json();
      if(!response.ok) throw new Error('Webhook configuration failed: HTTP '+response.status+' '+(data.message||''));
      console.log(JSON.stringify(data));
    })().catch(e=>{console.error(e.message);process.exitCode=1});"""
    proc=subprocess.run(['docker','compose','-p','flowmeet-platform','exec','-T','flowmeet-web','node'],input=script,text=True,capture_output=True,cwd=root)
    if proc.returncode:raise RuntimeError(proc.stderr.strip())
    data=json.loads(proc.stdout)
    if not data.get('signing_secret'):raise RuntimeError('Provider did not return webhook signing secret')
    settings['RESEND_WEBHOOK_SECRET']=data['signing_secret'];settings['FLOWMEET_RESEND_WEBHOOK_ID']=data['id']
    print('Created live Resend delivery webhook; signing secret saved privately')
env.write_text('\n'.join(f'{k}={v}' for k,v in settings.items())+'\n');env.chmod(0o600)
print('Acceptance configuration prepared; no messages sent')
