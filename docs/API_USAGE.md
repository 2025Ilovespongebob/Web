# API 사용 가이드

## 설정

### 1. Axios 인스턴스 (`lib/axios.ts`)
- 백엔드 URL 설정
- 요청/응답 인터셉터
- 인증 토큰 관리

### 2. Query Client (`lib/query-client.ts`)
- TanStack Query 설정
- 캐시 전략 설정

### 3. Root Layout (`app/_layout.tsx`)
- QueryClientProvider로 앱 전체 감싸기

## 사용 예제

### 1. 줍깅 기록 목록 조회

```tsx
import { usePloggingRecords } from '@/hooks/use-plogging-api';

function RecordList() {
  const { data, isLoading, error } = usePloggingRecords();

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>에러 발생</Text>;

  return (
    <View>
      {data?.map((record) => (
        <Text key={record.id}>{record.location}</Text>
      ))}
    </View>
  );
}
```

### 2. 줍깅 기록 생성

```tsx
import { useCreatePloggingRecord } from '@/hooks/use-plogging-api';

function CreateRecord() {
  const createMutation = useCreatePloggingRecord();

  const handleCreate = () => {
    createMutation.mutate({
      date: '2024-12-30',
      location: '해운대',
      distance: '1.1km',
      duration: '1시간 2분',
      trashCount: 62,
      carbonReduction: 5.05,
    });
  };

  return (
    <Button 
      onPress={handleCreate}
      disabled={createMutation.isPending}
    >
      {createMutation.isPending ? '저장 중...' : '저장'}
    </Button>
  );
}
```

### 3. 줍깅 통계 조회

```tsx
import { usePloggingStats } from '@/hooks/use-plogging-api';

function StatsView() {
  const { data, isLoading } = usePloggingStats();

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      <Text>총 거리: {data?.totalDistance}km</Text>
      <Text>총 시간: {data?.totalTime}시간</Text>
      <Text>총 쓰레기: {data?.totalTrash}개</Text>
    </View>
  );
}
```

### 4. 줍깅 기록 삭제

```tsx
import { useDeletePloggingRecord } from '@/hooks/use-plogging-api';

function DeleteButton({ recordId }: { recordId: string }) {
  const deleteMutation = useDeletePloggingRecord();

  const handleDelete = () => {
    deleteMutation.mutate(recordId, {
      onSuccess: () => {
        Alert.alert('성공', '삭제되었습니다');
      },
      onError: (error) => {
        Alert.alert('오류', '삭제 실패');
      },
    });
  };

  return (
    <Button onPress={handleDelete}>
      삭제
    </Button>
  );
}
```

## 백엔드 URL 설정

`lib/axios.ts` 파일에서 BASE_URL을 수정하세요:

```typescript
const BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' // 개발 환경
  : 'https://your-production-api.com/api'; // 프로덕션 환경
```

## 인증 토큰 추가

`lib/axios.ts`의 요청 인터셉터에서 토큰을 추가할 수 있습니다:

```typescript
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken(); // 토큰 가져오기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

## 캐시 무효화

데이터 변경 후 캐시를 무효화하려면:

```typescript
import { queryClient } from '@/lib/query-client';

// 특정 쿼리 무효화
queryClient.invalidateQueries({ queryKey: ['plogging', 'records'] });

// 모든 줍깅 관련 쿼리 무효화
queryClient.invalidateQueries({ queryKey: ['plogging'] });
```

## 에러 처리

```tsx
const { data, error, isError } = usePloggingRecords();

if (isError) {
  console.error('Error:', error);
  return <Text>에러: {error.message}</Text>;
}
```
