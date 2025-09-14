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
          provider="cloudinary"
          :src="`${config.public.cloudinary.baseUrl}/logo_iso-land_shliv5.svg`"
          alt=""
          width="360"
          height="144"
          class="flex items-center"
        />
      </template>
      <NuxtImg
        provider="cloudinary"
        :src="`${config.public.cloudinary.baseUrl}/hero_s1dvwi.png`"
        alt=""
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
        <div class="relative overflow-hidden rounded-sm border border-dashed border-accented opacity-75 px-4 flex items-center justify-center aspect-video">
          <svg
            class="absolute inset-0 h-full w-full stroke-inverted/10"
            fill="none"
          >
            <defs>
              <pattern
                id="pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e"
                x="0"
                y="0"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
              </pattern>
            </defs>
            <rect
              stroke="none"
              fill="url(#pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e)"
              width="100%"
              height="100%"
            />
          </svg>
          aaa
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
        <div class="relative overflow-hidden rounded-sm border border-dashed border-accented opacity-75 px-4 flex items-center justify-center aspect-video">
          <svg
            class="absolute inset-0 h-full w-full stroke-inverted/10"
            fill="none"
          >
            <defs>
              <pattern
                id="pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e"
                x="0"
                y="0"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
              </pattern>
            </defs>
            <rect
              stroke="none"
              fill="url(#pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e)"
              width="100%"
              height="100%"
            />
          </svg>
          aaa
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
        <div class="relative overflow-hidden rounded-sm border border-dashed border-accented opacity-75 px-4 flex items-center justify-center aspect-video">
          <svg
            class="absolute inset-0 h-full w-full stroke-inverted/10"
            fill="none"
          >
            <defs>
              <pattern
                id="pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e"
                x="0"
                y="0"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
              </pattern>
            </defs>
            <rect
              stroke="none"
              fill="url(#pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e)"
              width="100%"
              height="100%"
            />
          </svg>
          aaa
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
