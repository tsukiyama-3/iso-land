<script setup lang="ts">
const config = useRuntimeConfig()

const links = ref([
  {
    label: '今すぐ始める',
    to: '/',
    icon: 'lucide:rocket',
    variant: 'subtle',
  },
])
</script>

<template>
  <UContainer>
    <!-- Hero -->
    <UPageHero
      description="マップで好きな場所を選び、簡単なプロンプトを入力するだけで、その場所のアイソメトリック画像を生成しよう"
      headline="About Service"
      orientation="horizontal"
      :links="links"
    >
      <template #title>
        <NuxtImg
          :src="`${config.public.cloudinary.baseUrl}/logo_iso-land_shliv5.svg`"
          alt=""
          width="360"
          height="144"
          class="flex items-center"
        />
      </template>
      <NuxtImg
        :src="`${config.public.cloudinary.baseUrl}/hero_s1dvwi.png`"
        alt=""
        format="avif,webp"
        width="512"
        height="512"
        class="rounded-lg"
      />
    </UPageHero>

    <!-- 使い方 -->
    <UPageSection
      title="生成したい場所をマップで選び"
      orientation="horizontal"
      reverse
    >
      <UPageCard
        variant="subtle"
      >
        <div class="relative overflow-hidden rounded-sm border border-dashed border-accented px-4 flex items-center justify-center aspect-video">
          <NuxtImg
            :src="`${config.public.cloudinary.baseUrl}/localhost_3000__7_eczpuu.png`"
            alt=""
            format="avif,webp"
            width="512"
            height="512"
            class="rounded-lg"
          />
        </div>
      </UPageCard>
    </UPageSection>

    <UPageSection
      title="簡単なプロンプトを送信すると"
      orientation="horizontal"
    >
      <UPageCard
        variant="subtle"
      >
        <div class="relative overflow-hidden rounded-sm border border-dashed border-accented px-4 flex items-center justify-center aspect-video">
          <NuxtImg
            :src="`${config.public.cloudinary.baseUrl}/step-2_plju1y.png`"
            alt=""
            format="avif,webp"
            width="512"
            class="rounded-lg aspect-video"
          />
        </div>
      </UPageCard>
    </UPageSection>

    <UPageSection
      title="その場所のアイソメトリックな画像が生成されます"
      orientation="horizontal"
      reverse
    >
      <UPageCard
        variant="subtle"
      >
        <div class="relative overflow-hidden rounded-sm border border-dashed border-accented px-4 flex items-center justify-center aspect-video">
          <NuxtImg
            :src="`${config.public.cloudinary.baseUrl}/step-3_ee0olh.png`"
            alt=""
            format="avif,webp"
            width="512"
            class="rounded-lg"
          />
        </div>
      </UPageCard>
    </UPageSection>

    <!-- Feature -->
    <UPageSection
      title="サービスの特徴"
    >
      <UPageGrid>
        <UPageCard
          title="ユーザー登録不要"
          icon="lucide:user"
          description="誰でもすぐに地図で場所を選んで、短いプロンプトを入力するだけで、街のアイソメトリックな画像を生成できます。"
          spotlight
        />
        <UPageCard
          title="無料で楽しめる"
          icon="lucide:party-popper"
          description="画像生成には1枚あたり $0.03 のコストがかかりますが、その費用は開発者が負担しています。開発者の資金が尽きた場合、サービス終了します。"
          spotlight
        />
        <UPageCard
          title="生成した画像をシェアして楽しもう"
          icon="lucide:share-2"
          description="生成された街のイラストはギャラリーページで公開され、他のユーザーが生成した画像も楽しめます。"
          spotlight
        />
      </UPageGrid>
    </UPageSection>
  </UContainer>
</template>
