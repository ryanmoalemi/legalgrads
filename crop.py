from PIL import Image
A='/cursor/stores/store-8421181a-701d-4291-b5f9-1df48755b39a/grok-bot/agents/ce46cc3f-1601-40cd-bc11-de469c8f4844/attachments/'
D=Image.open(A+'01M5G4G9DTFDKQZ3QJ2Q4PEGKP.png').convert('RGB');M=Image.open(A+'01M5G4GBQXYHE7VB8Q8V02T1P7.png').convert('RGB')
O='/workspace/legalgrads/img/'
boxes={
 'd-logo':(D,(60,45,470,145)),'d-pill':(D,(1235,28,1468,88)),'d-art':(D,(795,120,1536,790)),'d-spark':(D,(742,170,800,250)),
 'm-logo':(M,(50,66,428,163)),'m-pill':(M,(510,87,750,156)),'m-burger':(M,(782,95,840,145)),'m-spark':(M,(705,185,795,290)),'m-art':(M,(8,690,877,1410)),
}
for i,cx in enumerate((90,440,815,1195)):boxes[f'icon{i}']=(D,(cx-45,800,cx+45,890))
import json
for n,(im,b) in boxes.items():
  c=im.crop(b);c.save(O+n+'.webp',quality=92,method=6)
json.dump({k:v[1] for k,v in boxes.items()},open('/workspace/legalgrads-build/boxes.json','w'))
