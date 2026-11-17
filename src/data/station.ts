export type DialogueLine = { speaker: 'narrator' | 'npc' | 'player' | 'record'; text: string };

type StationRoom = {
  name: string;
  color: string;
  fixtures: 'security' | 'data' | 'chemical' | 'water' | 'power' | 'plants' | 'climate' | 'specimens' | 'command';
  devices: string[];
  arrival: DialogueLine[];
  conversation: DialogueLine[];
  record: { name: string; text: string; clue: string };
  departure?: string;
};

export const roomData: Record<string, StationRoom> = {
  gateway: {
    name: '入口管制室', color: '#95f4d8', fixtures: 'security', devices: ['備份標籤', '備份分頁機', '卡片分流器'],
    arrival: [
      { speaker: 'narrator', text: '你來研究站的第一天，本來是來幫忙拍溫室小苗的第一片新葉。剛踏進門，身後的走廊卻一盞盞陷入黑暗。' },
      { speaker: 'npc', text: '嗶！你終於來了。這裡是管制室，所有門開過的時間都存在裡頭。只剩我旁邊這台備份盒能用，過來幫我看看。' },
    ],
    conversation: [
      { speaker: 'npc', text: '備份盒記得裡面有 3,000 筆資料，卻忘了盒外的標籤。我得把標籤貼回去，才讀得到那份紀錄。' },
      { speaker: 'player', text: '標籤上的 10 右上角，怎麼還有一個小數字？' },
      { speaker: 'npc', text: '那叫指數。10² 是兩個 10 相乘，也就是 100。小數字變成 3，就換成三個 10 相乘。' },
    ],
    record: {
      name: '交班錄音',
      text: '05:39｜門鎖和儀器時間都是對的，數字旁也有單位。我先把今天的紀錄存一份到管制室。',
      clue: '這是停電前的備份。把它和控制中心故障後的紀錄一起看，就知道哪些資料後來不見了。',
    },
    departure: '下一站是控制中心。林工程師正在等我們，別讓他光憑螢幕上的數字就拆掉整條水管。',
  },
  control: {
    name: '控制中心', color: '#86d6ff', fixtures: 'data', devices: ['感測曲線儀', '雜訊濾波台', 'A 泵流量標籤'],
    arrival: [
      { speaker: 'narrator', text: '螢幕上一整排警告都寫著「水管堵塞」。你趴下來聽，隔著地板還聽得到水流聲。' },
      { speaker: 'npc', text: '這裡替全站看水和電。管子在流，畫面卻說一滴也沒有。我先不拆管子，過來幫我做個對照。' },
    ],
    conversation: [
      { speaker: 'npc', text: '我送進去的是電流，機器回給我的是螢幕格數。即使電流是零，螢幕也會先亮四格。' },
      { speaker: 'player', text: '也就是螢幕上看到幾格，還要找它對應多少電流？' },
      { speaker: 'npc', text: '對。圖上每個圓點都是一組測試結果。先在左側找螢幕的數字，再往右找圓點，往下看它代表多少電流。' },
    ],
    record: {
      name: '斷線後的通訊',
      text: '05:40｜連線中斷了。重新連上後，螢幕傳來的數字還在，旁邊的單位欄卻都空白。',
      clue: '「14 格」和「14 mA」是兩件事。發現單位不見之後，記得用校正圖查回實際讀值。',
    },
    departure: '周博士的反應觀測艙也收到離奇的警報。拿這份紀錄給他看，問問他的獨立儀器怎麼說。',
  },
  chemistry: {
    name: '反應觀測艙', color: '#f5bd85', fixtures: 'chemical', devices: ['分子計數台', '密閉艙天平', '熱流驗收台'],
    arrival: [
      { speaker: 'narrator', text: '周博士把一張警報紙壓在密閉盒下面。上面寫著「原子比剛才多」，他用筆畫了兩個大問號。' },
      { speaker: 'npc', text: '這個房間可以看東西怎麼變成別的東西。警報說多出原子，我要先自己數一次。' },
    ],
    conversation: [
      { speaker: 'player', text: '這要怎麼數？我連原子都看不見。' },
      { speaker: 'npc', text: '把分子想成積木。H₂ 有兩塊氫積木，H₂O 則有兩塊氫和一塊氧。把兩杯模型裡的積木重新組，可以拼成水。' },
      { speaker: 'npc', text: '反應式前面的數字像「拿幾個」。例如 2 H₂ 就有四塊氫。等下用這個方法讓左右兩邊的數量一樣。' },
    ],
    record: {
      name: '隔壁水杯的紀錄',
      text: '05:41｜牆上的電暖器沒有開。沒有做反應的那杯水一直是 22 °C，只有靠著反應槽的水變暖。',
      clue: '兩杯放在一起比較，才看得出水變暖和反應有關。等下在熱流台可以用這個方法判斷熱往哪走。',
    },
    departure: '拿著空瓶去水質分析站。我想親手量一量剛才流進回收槽的水。',
  },
  'water-lab': {
    name: '水質分析站', color: '#7ee4ef', fixtures: 'water', devices: ['水樣分析台', '酸度計', '回流水槽'],
    arrival: [
      { speaker: 'narrator', text: '四瓶水排在架上，光看外表完全分不出來。只有一瓶來自剛才出問題的回收槽。' },
      { speaker: 'npc', text: '水送回溫室之前，都得在這裡抽樣。我帶來一支不用連線的探針。你量完四瓶，我們就知道哪瓶水有問題。' },
    ],
    conversation: [
      { speaker: 'npc', text: '像檸檬汁這樣的酸性溶液，pH 會比 7 小。這四瓶是常溫樣本，我們也把 pH 7 當成中性的讀值。' },
      { speaker: 'player', text: '探針除了 pH，還有一個寫「導電」的數字。' },
      { speaker: 'npc', text: '那一格表示電能不能容易地通過水。食鹽水可以接近中性，也能導電。兩個數字要分開看。' },
    ],
    record: {
      name: '取水留言',
      text: '05:42｜我從回收槽另外取了一次樣。只有這一槽真的量到酸。全站警報的那份資料比這次採樣還早。',
      clue: '眼前量到的局部酸水需要處理。這瓶水不能證明整座站都被污染，別用一處的結果替其他地方下結論。',
    },
    departure: '水整理好了，抽水泵卻還沒電。去備援艙找林工程師，他在等我們帶來好消息。',
  },
  power: {
    name: '電力備援艙', color: '#ffce69', fixtures: 'power', devices: ['鋅銅電表', '電子追蹤台', '測試電路'],
    arrival: [
      { speaker: 'narrator', text: '一排開關都停在「關」。牆上掛著溫室照明的回路牌，牌下卻沒有燒焦或破損的痕跡。' },
      { speaker: 'npc', text: '這裡能用獨立的電表讀停電紀錄。我們先接一顆小電池救醒電表，查查是什麼讓主電力斷掉。' },
    ],
    conversation: [
      { speaker: 'npc', text: '桌上有鋅片和銅片。鋅會把電子送出去，銅片那邊的銅離子會接到電子。' },
      { speaker: 'player', text: '中間那條小管子呢？它看起來不像電線。' },
      { speaker: 'npc', text: '那是鹽橋，讓水裡帶電的離子在兩杯之間移動。導線讓電子走，鹽橋負責溶液裡的那一段。' },
    ],
    record: {
      name: '停電瞬間的錄音',
      text: '05:42｜我聽到控制器說「電流太大，切電」。但同一時間，我旁邊的獨立電表並沒有超標。',
      clue: '不是每個量測都在說同一件事。把這段和控制中心那張「格數對應電流」的圖留著，最後還會用到。',
    },
    departure: '接到溫室的補光燈也跟著停了。快去找何研究員，他今天還等著拍小苗的第一片新葉。',
  },
  greenhouse: {
    name: '實驗溫室', color: '#b8eb9b', fixtures: 'plants', devices: ['環控驗收台', '氣體交換儀', '暗室實驗台'],
    arrival: [
      { speaker: 'narrator', text: '玻璃上起了一層霧。何研究員拿著相機，手電筒照到那株剛長出新葉的小苗。' },
      { speaker: 'npc', text: '你來得正好。這間溫室專門看植物怎麼吸收和放出二氧化碳。燈滅了以後，讀數整個反過來。' },
    ],
    conversation: [
      { speaker: 'npc', text: '有光時，葉片能用水和 CO₂ 做糖。太暗，或水太少，做糖的速度都會變慢。' },
      { speaker: 'player', text: '那沒光的時候，植物也完全停止活動嗎？' },
      { speaker: 'npc', text: '它還能用以前做好的糖來呼吸，會放出 CO₂。面板寫的「淨吸收」，就是吸進去的量扣掉呼吸放出的量。' },
    ],
    record: {
      name: '小苗的夜間紀錄',
      text: '05:46｜燈熄後，葉片吸進去的 CO₂ 變少了，呼吸仍會放出 CO₂。面板從淨吸收變成淨放出。',
      clue: '這份紀錄比停電晚。植物的變化是停電後才出現的結果，可以用來排事故的先後順序。',
    },
    departure: '把這組吸進和放出的紀錄帶去氣候控制室。那裡也在算大氣的碳多了多少。',
  },
  climate: {
    name: '氣候控制室', color: '#a3dcfb', fixtures: 'climate', devices: ['碳庫驗收台', '流域水位計', '長波接收器'],
    arrival: [
      { speaker: 'narrator', text: '大螢幕上有一場小小的雨。另一角的紅燈一直閃，曾經吸收碳的那片森林現在暫停了。' },
      { speaker: 'npc', text: '這裡模擬大氣、水和熱怎麼來來去去。溫室剛修好，我們現在能重新算碳和水的帳。' },
    ],
    conversation: [
      { speaker: 'npc', text: '把碳當成記在一本帳上。排放把碳加進大氣，植物會從大氣把一部分吸走。' },
      { speaker: 'player', text: '如果一直種植物，就能把多出來的全部吸掉嗎？' },
      { speaker: 'npc', text: '還得給植物水。今天的水也有上限，所以要一邊少排，一邊用手上的水讓植物多吸一點。' },
    ],
    record: {
      name: '太空測熱備註',
      text: '06:02｜三次測試收進來的太陽能都一樣。比較的是各自送回太空的熱。',
      clue: '進來的多、送出的少，就會有能量留在地球系統裡。點圖時只要找送出的熱和收進來相同的那一次。',
    },
    departure: '這份研究報告說甲蟲在雨後也會一樣變化。何研究員記得事情不是這樣，去演化區找原來的紙本。',
  },
  evolution: {
    name: '演化研究區', color: '#f3b8ec', fixtures: 'specimens', devices: ['世代讀圖儀', '族群紀錄台', '標本比對台'],
    arrival: [
      { speaker: 'narrator', text: '架上有乾、濕兩種培養箱。旁邊的報告要撤掉薄殼甲蟲那一箱，可是「潮濕」那一頁被折在底下。' },
      { speaker: 'npc', text: '我在這裡看甲蟲一代一代怎麼變。先別撤箱，乾的地方和濕的地方可能會得到不同的結果。' },
    ],
    conversation: [
      { speaker: 'npc', text: '每一代都觀察十隻，這樣才比較得出厚殼變多或變少。十隻的一半是五隻。' },
      { speaker: 'player', text: '如果圖上厚殼變多，是那十隻甲蟲長大後把自己的殼換厚了嗎？' },
      { speaker: 'npc', text: '每個圓點是新一代的十隻，不是同樣那十隻。把乾、濕兩箱和家系一起比較，就能知道為什麼幾代後的比例可能不同。' },
    ],
    record: {
      name: '被漏掉的雨後紀錄',
      text: '06:15｜程式只拿了乾燥箱那一頁就輸出報告。雨後和潮濕箱的數字其實還留在原本的觀察本。',
      clue: '乾燥時有優勢，不代表潮濕時也有。未來重新啟動系統時，我們要讓兩種紀錄都能保留。',
    },
    departure: '走廊最裡面的門終於亮了。把紙本紀錄帶去中央指揮台，讓 GAIA 看看事情的順序。',
  },
  finale: {
    name: '中央指揮台', color: '#ffdf83', fixtures: 'command', devices: ['警報複測器', '重啟調度台', '事故時間線', '分區復電台'],
    arrival: [
      { speaker: 'narrator', text: '最後一扇門打開了。所有人把找到的紙本和錄音攤在桌上。中央螢幕只亮一格，等你下令。' },
      { speaker: 'npc', text: '八區自己的設備都能用了。這裡能讓它們一起工作，但在拉下開關前，我想知道我們到底修好了什麼。' },
    ],
    conversation: [
      { speaker: 'npc', text: '還記得控制中心那張圖嗎？螢幕亮的是格數。警報當時亮了 14 格，控制器卻把它當成電流。' },
      { speaker: 'player', text: '先把空著就亮的那幾格扣掉，再看剩下的格數代表多少電流。' },
      { speaker: 'npc', text: '對。之前的每份紀錄都有用。這次我們用它們把時間線和復電順序弄清楚，再去拍那張照片。' },
    ],
    record: {
      name: '留給下個值班員的便條',
      text: '啟動前問三件事。這是誰量的？什麼時候量的？數字的單位是什麼？',
      clue: '有了這三件事，大家才能把不同房間的量測放在一起比較。復電也一區一區做，有問題就能在那裡停下。',
    },
    departure: '你從玻璃上看見自己的倒影。今天的照片裡，會有小苗的新葉，也會有整座亮著燈的研究站。',
  },
};
