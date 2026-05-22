<template>
  <SportBackground />
  <div class="min-h-screen text-slate-800 antialiased pb-12" style="font-family: ui-sans-serif, system-ui, sans-serif;">

    <!-- Top gradient bar -->
    <div class="h-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 w-full"></div>

    <!-- Nav -->
    <header class="bg-[#0a0e1a] border-b border-cyan-500/20 sticky top-0 z-40 px-4 py-3.5">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3.5">
          <button @click="goBack" class="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500/20 border border-cyan-500/20 transition">
            <ChevronLeft class="w-5 h-5" />
          </button>
          <div>
            <h1 class="text-base font-semibold text-white tracking-tight" style="font-family: 'Courier New', monospace;">个人资料中心</h1>
            <p class="text-xs text-cyan-400/60">智能头盔系统 · 个人账户</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button v-if="!isEditing" @click="isEditing = true"
            class="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium text-sm px-4 py-2 rounded-xl transition active:scale-95">
            <Edit3 class="w-4 h-4" /><span>修改资料</span>
          </button>
          <button v-else @click="saveProfile"
            class="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium text-sm px-4 py-2 rounded-xl transition active:scale-95">
            <Check class="w-4 h-4" /><span>保存更改</span>
          </button>
          <button v-if="isEditing" @click="cancelEdit"
            class="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 mt-6 space-y-6">

      <!-- ① Banner / Avatar Card -->
      <section class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <!-- Banner: Lottie animation -->
        <div class="h-40 bg-[#0d0d1a] overflow-hidden relative">
          <canvas ref="gerenCanvasRef" class="absolute inset-0 w-full h-full"></canvas>
        </div>

        <!-- Avatar overlap -->
        <div class="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between -mt-14 z-20">
          <div class="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-4 sm:gap-5">
            <!-- Avatar -->
            <div class="relative group">
              <div v-if="!store.avatarData"
                class="w-28 h-28 rounded-3xl border-4 border-white shadow-md flex items-center justify-center"
                :style="{ background: gradientPresets[avatarPresetIndex].bg }">
                <span class="text-white font-bold text-4xl select-none">{{ initials }}</span>
              </div>
              <div v-else class="w-28 h-28 rounded-3xl border-4 border-white shadow-md bg-cover bg-center overflow-hidden"
                :style="{ backgroundImage: `url(${store.avatarData})` }"></div>
              <div @click="showAvatarPicker = !showAvatarPicker"
                class="absolute -bottom-1 -right-1 p-2 bg-slate-900 border-2 border-white hover:bg-slate-800 text-white rounded-xl shadow cursor-pointer transition hover:scale-105 active:scale-95">
                <Upload class="w-4 h-4" />
              </div>
            </div>

            <!-- Name/bio -->
            <div class="flex-1 pb-1">
              <div class="flex flex-col sm:flex-row items-center gap-2">
                <h2 class="text-2xl font-bold text-slate-950 tracking-tight">{{ store.nickname || '未设置姓名' }}</h2>
                <span v-if="store.gender" class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="genderBadgeClass">{{ store.gender }}</span>
                <span class="text-xs text-slate-400 font-mono">{{ store.age ? store.age + ' 岁' : '' }}</span>
              </div>
              <div v-if="!isEditing" class="mt-1.5 text-sm text-slate-500 max-w-md line-clamp-2">
                {{ store.bio || '这家伙很懒，什么都没有留下。' }}
              </div>
              <div v-else class="mt-1.5">
                <input type="text" :value="store.bio" @change="e => store.setBio(e.target.value)"
                  placeholder="用一句话介绍自己..." maxlength="80"
                  class="up-input text-sm w-full sm:max-w-sm" />
              </div>
            </div>
          </div>
        </div>

        <!-- Avatar picker drawer -->
        <div v-if="showAvatarPicker" class="border-t border-slate-100 bg-slate-50/70 p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-violet-500" />更换头像风格
            </h3>
            <button @click="showAvatarPicker = false" class="text-slate-400 hover:text-slate-600">
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">流光预设渐变</p>
              <div class="flex gap-2 flex-wrap">
                <button v-for="(p, i) in gradientPresets" :key="i"
                  @click="selectPresetAvatar(i)"
                  class="w-10 h-10 rounded-xl cursor-pointer hover:scale-105 active:scale-95 border transition flex items-center justify-center text-[10px] text-white font-bold"
                  :style="{ background: p.bg }"
                  :class="[!store.avatarData && avatarPresetIndex === i ? 'border-violet-500 ring-2 ring-violet-200' : 'border-transparent']"
                  :title="p.name">{{ initials }}</button>
              </div>
            </div>
            <div class="flex flex-col justify-center border-l border-slate-200/60 pl-4">
              <p class="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">本地照片上传</p>
              <div class="flex items-center gap-2">
                <button @click="fileInputRef?.click()"
                  class="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition">
                  <Upload class="w-3.5 h-3.5" />选择本地图像...
                </button>
                <button v-if="store.avatarData" @click="store.setAvatarData('')"
                  class="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-xl transition">
                  <Trash2 class="w-4 h-4" />
                </button>
                <input type="file" ref="fileInputRef" @change="handleAvatarUpload" class="hidden" accept="image/*" />
              </div>
              <p class="text-[10px] text-slate-400 mt-1.5">支持 PNG, JPG。大小不超过 2MB。</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ③ Bento grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- 基本信息 -->
        <section class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User class="w-4 h-4 text-violet-500" /><span>基本身份信息</span>
            </h3>
            <span class="text-[10px] font-semibold text-slate-400 font-mono tracking-wider uppercase">IDENTITY</span>
          </div>

          <!-- View -->
          <div v-if="!isEditing" class="space-y-4 flex-1">
            <div class="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span class="text-sm font-medium text-slate-500">真实姓名</span>
              <span class="text-sm font-semibold text-slate-900">{{ store.nickname || '--' }}</span>
            </div>
            <div class="flex justify-between items-center py-1.5 border-b border-slate-50">
              <div class="flex items-center gap-2"><Calendar class="w-4 h-4 text-slate-400" /><span class="text-sm font-medium text-slate-500">周岁年龄</span></div>
              <span class="text-sm font-bold text-slate-900 font-mono">{{ store.age || '--' }} <span class="text-slate-400 font-normal text-xs font-sans">岁</span></span>
            </div>
            <div class="flex justify-between items-center py-1.5 border-b border-slate-50">
              <div class="flex items-center gap-2"><Sparkles class="w-4 h-4 text-slate-400" /><span class="text-sm font-medium text-slate-500">法定性别</span></div>
              <span class="text-sm font-semibold text-slate-900">{{ store.gender || '--' }}</span>
            </div>
            <div class="flex justify-between items-center py-1.5 border-b border-slate-50">
              <div class="flex items-center gap-2"><Scale class="w-4 h-4 text-slate-400" /><span class="text-sm font-medium text-slate-500">身高</span></div>
              <span class="text-sm font-bold text-slate-900 font-mono">{{ store.height || '--' }} <span class="text-slate-400 font-normal text-xs font-sans">cm</span></span>
            </div>
            <div class="flex justify-between items-center py-1.5 border-b border-slate-50">
              <div class="flex items-center gap-2"><Droplets class="w-4 h-4 text-slate-400" /><span class="text-sm font-medium text-slate-500">血型</span></div>
              <span class="text-sm font-bold text-slate-900 font-mono">{{ store.bloodType || '--' }}</span>
            </div>
            <div class="flex justify-between items-center py-1.5">
              <div class="flex items-center gap-2"><AlertTriangle class="w-4 h-4 text-slate-400" /><span class="text-sm font-medium text-slate-500">过敏原</span></div>
              <span class="text-sm text-slate-700 max-w-[55%] text-right">{{ store.allergies || '--' }}</span>
            </div>
          </div>

          <!-- Edit -->
          <div v-else class="space-y-3 flex-1">
            <div class="flex items-center gap-3 py-2 border-b border-slate-50">
              <label class="text-sm font-medium text-slate-500 w-20 flex-shrink-0">姓名</label>
              <input type="text" :value="store.nickname" @change="e => store.setNickname(e.target.value)"
                class="up-input flex-1" :class="errors.name ? 'border-rose-400' : ''"
                placeholder="请输入真实姓名" maxlength="20" />
              <p v-if="errors.name" class="text-xs text-rose-500">{{ errors.name }}</p>
            </div>
            <div class="flex items-center gap-3 py-2 border-b border-slate-50">
              <label class="text-sm font-medium text-slate-500 w-20 flex-shrink-0">年龄</label>
              <input type="number" :value="store.age" @change="onAgeChange"
                class="up-input flex-1 font-mono" :class="errors.age ? 'border-rose-400' : ''"
                placeholder="0" min="0" max="150" />
              <span class="text-slate-400 text-sm flex-shrink-0">岁</span>
              <p v-if="errors.age" class="text-xs text-rose-500">{{ errors.age }}</p>
            </div>
            <div class="flex items-center gap-3 py-2 border-b border-slate-50">
              <label class="text-sm font-medium text-slate-500 w-20 flex-shrink-0">性别</label>
              <div class="flex gap-1.5 flex-wrap flex-1">
                <button v-for="g in ['男','女','其他','选择保密']" :key="g" type="button"
                  @click="store.setGender(g)"
                  class="px-2.5 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer"
                  :class="store.gender === g ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'">
                  {{ g }}
                </button>
              </div>
            </div>
            <div class="flex items-center gap-3 py-2 border-b border-slate-50">
              <label class="text-sm font-medium text-slate-500 w-20 flex-shrink-0">身高</label>
              <input type="number" :value="store.height" @change="onHeightChange"
                class="up-input flex-1 font-mono" :class="errors.height ? 'border-rose-400' : ''"
                placeholder="cm" min="50" max="250" />
              <span class="text-slate-400 text-sm flex-shrink-0">cm</span>
              <p v-if="errors.height" class="text-xs text-rose-500">{{ errors.height }}</p>
            </div>
            <div class="flex items-center gap-3 py-2 border-b border-slate-50">
              <label class="text-sm font-medium text-slate-500 w-20 flex-shrink-0">血型</label>
              <div class="flex gap-1.5 flex-wrap flex-1">
                <button v-for="bt in ['A','B','AB','O','A+','A-','B+','B-','AB+','AB-','O+','O-','不清楚']" :key="bt" type="button"
                  @click="store.setBloodType(bt)"
                  class="px-2 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer"
                  :class="store.bloodType === bt ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'">
                  {{ bt }}
                </button>
              </div>
              <span class="text-[10px] text-slate-400 flex-shrink-0" title="用于紧急救治参考，请如实填写">
                <Info class="w-3.5 h-3.5" />
              </span>
            </div>
            <div class="flex items-start gap-3 py-2">
              <label class="text-sm font-medium text-slate-500 w-20 flex-shrink-0 pt-2">过敏原</label>
              <div class="flex-1">
                <input type="text" :value="store.allergies" @change="e => store.setAllergies(e.target.value)"
                  class="up-input" placeholder="如：青霉素、花粉、坚果等" maxlength="200" />
                <p class="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Info class="w-3 h-3" />紧急救治参考，建议如实填写已知过敏物质
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- 健康与体重 -->
        <section class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale class="w-4 h-4 text-emerald-500" /><span>健康与身体指标</span>
            </h3>
            <div class="flex overflow-hidden rounded-xl border border-slate-200 text-xs">
              <button @click="store.setWeightUnit('kg')"
                class="px-2.5 py-1 font-semibold cursor-pointer transition"
                :class="store.weightUnit === 'kg' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'">KG</button>
              <button @click="store.setWeightUnit('lbs')"
                class="px-2.5 py-1 font-semibold cursor-pointer transition"
                :class="store.weightUnit === 'lbs' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'">LBS</button>
            </div>
          </div>

          <!-- View -->
          <div v-if="!isEditing" class="space-y-5 flex-1">
            <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
              <div>
                <p class="text-xs text-slate-400">目前注册体重</p>
                <div class="flex items-baseline gap-1.5 mt-0.5">
                  <span class="text-2xl font-bold font-mono text-slate-900">{{ displayWeight }}</span>
                  <span class="text-xs font-semibold text-slate-500 uppercase">{{ store.weightUnit }}</span>
                </div>
              </div>
              <div class="p-3 bg-white/80 rounded-xl shadow-sm">
                <Activity class="w-5 h-5 text-emerald-500 animate-pulse" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">体型特征指标 / STATUS</label>
              <div class="p-3.5 border rounded-2xl flex items-start gap-3" :class="fitnessStatus.color">
                <Flame class="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 class="text-xs font-bold leading-none mb-1">{{ fitnessStatus.label }}</h4>
                  <p class="text-[11px] opacity-80 leading-relaxed">{{ fitnessStatus.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit -->
          <div v-else class="space-y-5 flex-1">
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  体重 / Weight ({{ store.weightUnit?.toUpperCase() }})
                </label>
                <span class="text-sm font-bold font-mono text-emerald-600">{{ displayWeight }} {{ store.weightUnit?.toUpperCase() }}</span>
              </div>
              <div class="space-y-3">
                <input type="range" :value="displayWeight" @input="onWeightSlider"
                  :min="store.weightUnit === 'lbs' ? 66 : 30"
                  :max="store.weightUnit === 'lbs' ? 330 : 150"
                  step="0.5" class="up-slider" />
                <div class="flex items-center gap-3">
                  <label class="text-sm font-medium text-slate-500 w-20 flex-shrink-0">精确数值</label>
                  <input type="number" :value="displayWeight" @change="onWeightInput"
                    step="0.1" min="1" max="400"
                    class="up-input flex-1 font-mono" :class="errors.weight ? 'border-rose-400' : ''"
                    placeholder="手动键入..." />
                  <span class="text-slate-400 text-sm flex-shrink-0">{{ store.weightUnit }}</span>
                </div>
                <p v-if="errors.weight" class="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle class="w-3.5 h-3.5" />{{ errors.weight }}</p>
              </div>
            </div>
            <div class="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>温馨贴士：</strong>适量摄入富含膳食纤维食物，搭配合理的有氧与力量循环，可确保保持最佳体型状态。</span>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-slate-400 text-[11px]">
            <span class="flex items-center gap-1"><Activity class="w-3.5 h-3.5 text-emerald-400" /><span>智能健康计算面板</span></span>
            <span class="font-mono text-[10px]">FitStatus v1.2</span>
          </div>
        </section>

        <!-- 紧急联系人 (full width) -->
        <section class="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert class="w-4 h-4 text-rose-500" /><span>紧急情况救助联络人 (ICE)</span>
            </h3>
            <span class="text-[10px] bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full border border-rose-100">
              {{ contacts.length }} 位联系人
            </span>
          </div>

          <!-- Existing contacts - read-only view -->
          <div v-if="!isEditing && contacts.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div v-for="(c, i) in contacts" :key="c.id"
              class="bg-slate-50/50 rounded-2xl p-4 border flex flex-col gap-2"
              :class="priorityContactId === c.id ? 'border-rose-300 bg-rose-50/40' : 'border-slate-100/70'">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-xl flex-shrink-0"
                  :class="priorityContactId === c.id ? 'bg-rose-100 text-rose-600' : 'bg-rose-50 text-rose-400'">
                  <UserCircle class="w-5 h-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <p class="text-sm font-bold text-slate-900 truncate">{{ c.name }}</p>
                    <span v-if="priorityContactId === c.id"
                      class="text-[9px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">优先</span>
                  </div>
                  <p class="text-[10px] text-slate-400">{{ c.relation }}</p>
                </div>
              </div>
              <a :href="`tel:${c.phone}`" class="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline">
                <Phone class="w-3.5 h-3.5" />{{ c.phone }}
              </a>
            </div>
          </div>

          <!-- Existing contacts - edit view -->
          <div v-if="isEditing && contacts.length > 0" class="space-y-3 mb-5">
            <!-- Priority contact picker -->
            <div class="bg-rose-50/60 rounded-2xl p-4 border border-rose-100">
              <p class="text-xs font-bold text-slate-600 mb-3 flex items-center gap-1.5">
                <Star class="w-3.5 h-3.5 text-rose-500" />优先呼叫联系人
                <span class="text-slate-400 font-normal ml-1">— 紧急情况下首选联系</span>
              </p>
              <div class="flex flex-wrap gap-2">
                <button v-for="c in contacts" :key="'pri-'+c.id" type="button"
                  @click="priorityContactId = priorityContactId === c.id ? null : c.id"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition"
                  :class="priorityContactId === c.id
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:border-rose-200'">
                  <Star class="w-3 h-3" :class="priorityContactId === c.id ? 'fill-white' : ''" />
                  {{ c.name }}
                </button>
              </div>
            </div>

            <div v-for="(c, i) in contacts" :key="c.id"
              class="bg-slate-50/50 rounded-2xl p-4 border border-slate-200/80">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <UserCircle class="w-3.5 h-3.5 text-rose-400" />{{ c.name || '联系人 ' + (i+1) }}
                  <span v-if="priorityContactId === c.id" class="text-[9px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full">优先</span>
                </span>
                <button @click="removeContact(i)" class="text-slate-300 hover:text-rose-500 transition p-1">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">姓名</label>
                  <input type="text" v-model="c.name" class="up-input" placeholder="姓名" @change="updateContact(i)" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">关系</label>
                  <select v-model="c.relation" class="up-input" @change="updateContact(i)">
                    <option value="" disabled>请选择关系</option>
                    <option value="配偶">配偶</option>
                    <option value="父母">父母</option>
                    <option value="子女">子女</option>
                    <option value="兄弟姐妹">兄弟姐妹</option>
                    <option value="朋友">朋友</option>
                    <option value="同事">同事</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">电话</label>
                  <input type="text" v-model="c.phone" class="up-input font-mono" placeholder="联络电话" @change="updateContact(i)" />
                </div>
              </div>
            </div>
          </div>

          <!-- Add form - only in edit mode -->
          <div v-if="isEditing" class="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Plus class="w-3.5 h-3.5" />添加新联系人
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">姓名</label>
                <input type="text" v-model="contactForm.name"
                  class="up-input" :class="errors.emergencyName ? 'border-rose-400' : ''" placeholder="联系人姓名" />
                <p v-if="errors.emergencyName" class="text-xs text-rose-500 mt-1">{{ errors.emergencyName }}</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">关系</label>
                <select v-model="contactForm.relation" class="up-input">
                  <option value="" disabled>请选择关系</option>
                  <option value="配偶">配偶</option>
                  <option value="父母">父母</option>
                  <option value="子女">子女</option>
                  <option value="兄弟姐妹">兄弟姐妹</option>
                  <option value="朋友">朋友</option>
                  <option value="同事">同事</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">联络电话</label>
                <input type="text" v-model="contactForm.phone"
                  class="up-input font-mono" :class="errors.emergencyPhone ? 'border-rose-400' : ''"
                  placeholder="例：138-xxxx-xxxx" />
                <p v-if="errors.emergencyPhone" class="text-xs text-rose-500 mt-1">{{ errors.emergencyPhone }}</p>
              </div>
            </div>
            <button @click="addContact"
              :disabled="!contactForm.name || !contactForm.phone || !contactForm.relation"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition shadow-sm">
              <Plus class="w-4 h-4" />添加联系人
            </button>
          </div>

          <div v-if="contacts.length === 0"
            class="flex flex-col items-center gap-2 py-10 text-slate-300">
            <ShieldAlert class="w-10 h-10" />
            <span class="text-sm">暂无紧急联系人，点击"修改资料"添加</span>
          </div>
        </section>

      </div><!-- /bento -->
    </main>

    <!-- Toast -->
    <transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="translate-y-4 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95">
      <div v-if="toastShow"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-sm"
        :class="{
          'bg-slate-900/95 text-white border-slate-800': toastType === 'info',
          'bg-emerald-900/95 text-slate-100 border-emerald-800': toastType === 'success',
          'bg-rose-900/95 text-white border-rose-800': toastType === 'error'
        }">
        <CheckCircle2 v-if="toastType === 'success'" class="w-4 h-4 text-emerald-400" />
        <AlertCircle v-else class="w-4 h-4" :class="toastType === 'error' ? 'text-rose-400' : 'text-slate-400'" />
        <span class="text-sm font-medium tracking-tight">{{ toastMsg }}</span>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import SportBackground from '@/components/SportBackground.vue'
import { useUserProfileStore } from '@/stores/userProfile'
import request from '@/utils/request'
import { DotLottie } from '@lottiefiles/dotlottie-web'
import {
  ChevronLeft, User, Calendar, Scale, Phone, Heart, Edit3, Check, X,
  Upload, AlertCircle, AlertTriangle, ShieldAlert, Activity, UserCircle, Sparkles,
  Droplets, Flame, CheckCircle2, Trash2, Star,
  Plus, Info
} from 'lucide-vue-next'

const router = useRouter()
const store = useUserProfileStore()

const gerenCanvasRef = ref(null)
let gerenLottie = null

const isEditing = ref(false)
const showAvatarPicker = ref(false)
const fileInputRef = ref(null)
const avatarPresetIndex = ref(0)
const priorityContactId = ref(null)
const errors = reactive({ name: '', age: '', height: '', weight: '', emergencyName: '', emergencyPhone: '' })

function goBack() { router.push('/app') }

const gradientPresets = [
  { name: '晨曦紫罗兰', bg: 'linear-gradient(135deg, #a78bfa 0%, #fda4af 100%)' },
  { name: '深邃星空',   bg: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' },
  { name: '翡翠竹林',   bg: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' },
  { name: '烈焰骄阳',   bg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  { name: '珊瑚落日',   bg: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' },
  { name: '极光幻境',   bg: 'linear-gradient(135deg, #14b8a6 0%, #6366f1 100%)' },
]

const initials = computed(() => {
  const n = store.nickname || ''
  return n ? n.trim().charAt(0).toUpperCase() : '?'
})

const genderBadgeClass = computed(() => {
  const map = { '男': 'bg-sky-50 text-sky-600', '女': 'bg-pink-50 text-pink-600', '其他': 'bg-violet-50 text-violet-600', '选择保密': 'bg-slate-100 text-slate-500' }
  return map[store.gender] || 'bg-slate-100 text-slate-500'
})

function selectPresetAvatar(i) {
  avatarPresetIndex.value = i
  store.setAvatarData('')
  triggerToast('已应用预设头像: ' + gradientPresets[i].name)
}

function handleAvatarUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { triggerToast('图片大小不能超过 2MB', 'error'); return }
  const reader = new FileReader()
  reader.onload = ev => { store.setAvatarData(ev.target.result); triggerToast('自定义头像上传成功！') }
  reader.readAsDataURL(file)
}

const displayWeight = computed(() => {
  if (!store.weight) return ''
  if (store.weightUnit === 'lbs') return parseFloat((store.weight * 2.20462).toFixed(1))
  return store.weight
})

function onWeightSlider(e) {
  const v = parseFloat(e.target.value)
  store.setWeight(store.weightUnit === 'lbs' ? parseFloat((v / 2.20462).toFixed(1)) : v)
}

function onWeightInput(e) {
  const v = parseFloat(e.target.value)
  if (isNaN(v) || v <= 0) { errors.weight = '请输入合理的体重数值'; return }
  errors.weight = ''
  store.setWeight(store.weightUnit === 'lbs' ? parseFloat((v / 2.20462).toFixed(1)) : v)
}

const fitnessStatus = computed(() => {
  const w = store.weight, h = store.height
  if (!w || w <= 0) return { label: '未设定', desc: '请填写体重和身高以获取评估。', color: 'bg-slate-100 text-slate-700 border-slate-200' }
  const bmi = w / Math.pow((h ? h / 100 : 1.75), 2)
  if (bmi < 18.5) return { label: '偏瘦 / Underweight', desc: '当前 BMI 偏低，建议适当增加营养摄入和力量训练。', color: 'bg-amber-50 text-amber-600 border-amber-200' }
  if (bmi < 24)   return { label: '健康常规 / Fit & Balanced', desc: '当前 BMI 处于健康区间，保持均衡作息与科学膳食。', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
  if (bmi < 28)   return { label: '超重范围 / Overweight', desc: '当前 BMI 偏高，建议增加有氧运动并控制热量摄入。', color: 'bg-orange-50 text-orange-600 border-orange-200' }
  return { label: '严重超重 / High BMI', desc: '当前 BMI 较高，建议咨询专业医生制定健康计划。', color: 'bg-rose-50 text-rose-600 border-rose-200' }
})

function onAgeChange(e) {
  const v = parseInt(e.target.value, 10)
  if (isNaN(v) || v < 0 || v > 150) { errors.age = '请输入合理的年龄 (0-150)'; return }
  errors.age = ''; store.setAge(v)
}

function onHeightChange(e) {
  const v = parseInt(e.target.value, 10)
  if (isNaN(v) || v < 50 || v > 250) { errors.height = '请输入 50-250 cm'; return }
  errors.height = ''; store.setHeight(v)
}

function validateForm() {
  let ok = true
  if (!store.nickname?.trim()) { errors.name = '姓名不能为空'; ok = false } else errors.name = ''
  if (!store.age || store.age < 0 || store.age > 150) { errors.age = '请输入合理的年龄'; ok = false } else errors.age = ''
  if (!store.weight || store.weight <= 0) { errors.weight = '请输入合理的体重'; ok = false } else errors.weight = ''
  return ok
}

function saveProfile() {
  if (!validateForm()) { triggerToast('请检查输入表单后再保存', 'error'); return }
  isEditing.value = false
  showAvatarPicker.value = false
  if (priorityContactId.value != null) {
    localStorage.setItem('priority_contact_id', String(priorityContactId.value))
  } else {
    localStorage.removeItem('priority_contact_id')
  }
  store.saveToServer()
  triggerToast('资料已成功保存并同步至服务器！')
}

function cancelEdit() {
  isEditing.value = false
  Object.keys(errors).forEach(k => { errors[k] = '' })
}

const contacts = ref([])
const contactForm = ref({ name: '', phone: '', relation: '' })
const CONTACTS_KEY = 'emergency_contacts'

async function loadContacts() {
  try {
    const res = await request.get('/api/user/contacts')
    contacts.value = res.data
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(res.data))
  } catch {
    try { contacts.value = JSON.parse(localStorage.getItem(CONTACTS_KEY)) || [] } catch { contacts.value = [] }
  }
  const saved = localStorage.getItem('priority_contact_id')
  if (saved) priorityContactId.value = Number(saved)
}

async function addContact() {
  const { name, phone, relation } = contactForm.value
  if (!name.trim()) { errors.emergencyName = '姓名不能为空'; return }
  if (!phone.trim() || phone.trim().length < 5) { errors.emergencyPhone = '请输入有效的联系电话'; return }
  errors.emergencyName = ''; errors.emergencyPhone = ''
  try {
    const res = await request.post('/api/user/contacts', { name: name.trim(), phone: phone.trim(), relation, notes: '' })
    contacts.value.push(res.data)
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts.value))
    contactForm.value = { name: '', phone: '', relation: '' }
    triggerToast('联系人已添加')
  } catch {
    contacts.value.push({ id: Date.now(), name: name.trim(), phone: phone.trim(), relation, notes: '' })
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts.value))
    contactForm.value = { name: '', phone: '', relation: '' }
    triggerToast('联系人已添加（本地）', 'info')
  }
}

async function removeContact(i) {
  const c = contacts.value[i]
  try { await request.delete(`/api/user/contacts/${c.id}`) } catch { /* best-effort */ }
  contacts.value.splice(i, 1)
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts.value))
  triggerToast('联系人已删除', 'info')
}

async function updateContact(i) {
  const c = contacts.value[i]
  if (!c.id || String(c.id).length > 10) return // local-only entry, skip server sync
  try {
    await request.put(`/api/user/contacts/${c.id}`, {
      name: c.name, phone: c.phone, relation: c.relation, notes: c.notes || ''
    })
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts.value))
  } catch { /* best-effort */ }
}

const toastShow = ref(false)
const toastMsg = ref('')
const toastType = ref('success')
let toastTimer = null

function triggerToast(msg, type = 'success') {
  toastMsg.value = msg; toastType.value = type; toastShow.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastShow.value = false }, 3500)
}

onMounted(() => {
  store.loadFromServer()
  loadContacts()
  if (gerenCanvasRef.value) {
    const canvas = gerenCanvasRef.value
    const parent = canvas.parentElement
    canvas.width  = parent?.offsetWidth  || 800
    canvas.height = parent?.offsetHeight || 160
    gerenLottie = new DotLottie({
      canvas,
      src: '/animations/geren.lottie',
      loop: true,
      autoplay: true,
      renderConfig: {
        autoResize: true,
      },
      layout: {
        fit: 'fill',
        align: [0.5, 0.5],
      },
    })
  }
})

onUnmounted(() => {
  gerenLottie?.destroy()
})
</script>

<style scoped>
.up-input {
  width: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.up-input::placeholder { color: #cbd5e1; }
.up-input:focus { border-color: #c4b5fd; box-shadow: 0 0 0 3px rgba(167,139,250,0.25); }
select.up-input option { background: white; color: #1e293b; }

.up-slider {
  width: 100%;
  appearance: none;
  height: 0.375rem;
  border-radius: 9999px;
  background: #e2e8f0;
  cursor: pointer;
  outline: none;
}
.up-slider::-webkit-slider-thumb {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  background: #10b981;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.1s ease;
  cursor: pointer;
}
.up-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
</style>
