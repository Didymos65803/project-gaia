type StationRoom = {
  name: string;
  color: string;
  fixtures: 'security' | 'data' | 'chemical' | 'water' | 'power' | 'plants' | 'climate' | 'specimens' | 'command';
  devices: string[];
  opening: string;
  log: string;
};

export const roomData: Record<string, StationRoom> = {
  gateway: {
    name: '入口管制室', color: '#95f4d8', fixtures: 'security', devices: ['時序掃描器', '備份分頁機', '紀錄分流器'],
    opening: '嗶！這已經是我第三次重開機。拜託，先幫我把門邊那台時序掃描器救醒。',
    log: '05:39｜值班表：兩份事件紀錄每隔 72 μs 取樣一次。若時序失配，要從備援索引還原。',
  },
  control: {
    name: '控制中心', color: '#86d6ff', fixtures: 'data', devices: ['感測曲線儀', '雜訊濾波台', '雙支路閥'],
    opening: '管線還在流。牆上的螢幕卻喊著「堵塞」。把儀器一台台查過，我們才知道該相信誰。',
    log: '05:40｜備援同步中斷。緊急封包自此只保留螢幕數字，單位欄與校正版本欄皆空白。',
  },
  chemistry: {
    name: '反應觀測艙', color: '#f5bd85', fixtures: 'chemical', devices: ['分子計數台', '密閉艙天平', '熱流驗收台'],
    opening: '螢幕說原子憑空出現了。我把反應艙獨立接上，你來看看究竟是哪裡算錯。',
    log: '05:41｜外側水的溫度計與控制器分開供電，空白槽全程維持 22 °C。',
  },
  'water-lab': {
    name: '水質分析站', color: '#7ee4ef', fixtures: 'water', devices: ['水樣分析台', '酸度計', '回流水槽'],
    opening: '四瓶的標籤全沒了。探針在你手上，靠近每瓶就能量。把酸的那瓶找出來。',
    log: '05:42｜回流槽有局部酸性進水。別用舊封包的全站告警取代現場採樣。',
  },
  power: {
    name: '電力備援艙', color: '#ffce69', fixtures: 'power', devices: ['鋅銅電表', '電子追蹤台', '負載讀取器'],
    opening: '啟動器被上鎖了。先練一次備援接線：鋅片、銅片和鹽橋都在工作區。',
    log: '05:42｜主電網是收到控制器的一個隔離訊號才切掉。獨立供電未讀到跳脫電流。',
  },
  greenhouse: {
    name: '實驗溫室', color: '#b8eb9b', fixtures: 'plants', devices: ['環控驗收台', '氣體交換儀', '暗室實驗台'],
    opening: '燈一滅，CO₂ 就往外流。去調整三座設備，看葉片什麼時候能進行淨吸碳。',
    log: '05:46｜補光停止後，CO₂ 淨通量轉為釋出。葉片的有氧呼吸還在消耗糖。',
  },
  climate: {
    name: '氣候控制室', color: '#a3dcfb', fixtures: 'climate', devices: ['碳庫驗收台', '流域水位計', '長波接收器'],
    opening: '大氣與水庫各有一本帳。過來操作減排和復育，兩個庫存都平衡才送交驗收。',
    log: '06:02｜長波圖使用固定地表溫度的四個情境。淨能量為正時，地球系統會累積能量。',
  },
  evolution: {
    name: '演化研究區', color: '#f3b8ec', fixtures: 'specimens', devices: ['世代讀圖儀', '族群紀錄台', '標本比對台'],
    opening: '報告打算永久移除一個族群。我撿回了其中一份被丟掉的雨後紀錄，來幫我追查。',
    log: '06:15｜批次匯出只拿到乾燥環境，略過了潮濕對照與雨後樣本。',
  },
  finale: {
    name: '中央指揮台', color: '#ffdf83', fixtures: 'command', devices: ['警報複測器', '重啟調度台', '事故時間線', '分區復電台'],
    opening: '八區的電源已接通。現在輪到你決定何時全站重啟。把我們一路撿到的證物按時間排起來。',
    log: '備援建議｜任何會影響多區的指令都應查核來源、時間與單位，再逐區驗證。',
  },
};
